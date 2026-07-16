// GestionPagos.jsx
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function GestionPagos() {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [montosEfectivo, setMontosEfectivo] = useState({}); 
  const [procesandoId, setProcesandoId] = useState(null);
  
  const obtenerPedidosPendientes = async () => {
    try {
      const res = await axiosClient.get("/v1/pedidos");

      const pendientes = res.data.data.filter(
        (p) => p.estadoPago === "pendiente"
      );
      setPedidosPendientes(pendientes);
    } catch (error) {
      console.error("Error al obtener pedidos pendientes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPedidosPendientes();

    const interval = setInterval(obtenerPedidosPendientes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleValidarPago = async (pedido, vuelto = 0) => {
      setProcesandoId(pedido.id);
      try {
        await axiosClient.put(`/v1/pedidos/${pedido.id}/estado`, {
          nuevoEstadoPago: "validado",
          metodoPago: pedido.metodoPago,
          montoRecibido: pedido.metodoPago === "efectivo" ? Number(montosEfectivo[pedido.id]) : undefined,
        });
        setPedidosPendientes((prev) => prev.filter((p) => p.id !== pedido.id));
      } catch (error) {
        alert(error.response?.data?.mensaje || "Error al validar el pago");
      } finally {
        setProcesandoId(null);
      }
    };
  
    //para rechazar el pago (ej: efectivo falso, comprobante de transferencia invalido)
    const handleRechazarPago = async (pedido) => {
      if (!window.confirm(`¿Rechazar el pago del pedido N° ${pedido.numeroJornada}? El cliente verá que su pago fue rechazado.`)) return;
      setProcesandoId(pedido.id);
      try {
        await axiosClient.put(`/v1/pedidos/${pedido.id}/estado`, {
          nuevoEstadoPago: "rechazado",
        });
        setPedidosPendientes((prev) => prev.filter((p) => p.id !== pedido.id));
      } catch (error) {
        alert(error.response?.data?.mensaje || "Error al rechazar el pago");
      } finally {
        setProcesandoId(null);
      }
    };
  
    if (cargando) {
      return <div className="text-white text-center py-10">Cargando pagos pendientes...</div>;
    }
  
    return (
      <div className="p-6 bg-carbon-900 min-h-screen text-white">
        <header className="mb-6">
          <h1 className="text-2xl font-bold font-display text-brand-400">
            Caja · Validación de Pagos
          </h1>
          <p className="text-carbon-300 text-sm">
            Valida los pagos de autoservicio en efectivo o transferencia.
          </p>
        </header>
  
        {pedidosPendientes.length === 0 ? (
          <div className="bg-carbon-800 border border-carbon-700 rounded-card p-10 text-center text-carbon-400">
            No hay pagos pendientes de validación en este momento.
          </div>
        ) : (
          <div className="grid gap-4 max-w-4xl">
            {pedidosPendientes.map((pedido) => {
              const inputMonto = Number(montosEfectivo[pedido.id]) || 0;
              const vueltoCalculado = Math.max(0, inputMonto - pedido.total);
              const alcanzaParaPagar = inputMonto >= pedido.total;
              const procesando = procesandoId === pedido.id;
  
              return (
                <div
                  key={pedido.id}
                  className="bg-carbon-800 border border-accent/20 rounded-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/*datos del pedido*/}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">
                        Pedido N° {pedido.numeroJornada}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                          pedido.metodoPago === "efectivo"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {pedido.metodoPago === "efectivo" ? "Efectivo" : "Transferencia"}
                      </span>
                    </div>
                    <p className="text-xs text-carbon-400 mt-1">ID: {pedido.id}</p>
  
                    {/*detalles de productos*/}
                    <div className="mt-2 space-y-1">
                      {pedido.productos?.map((det, idx) => (
                        <p key={idx} className="text-sm text-carbon-200">
                          <span className="font-semibold text-brand-400">{det.cantidad}x</span> {det.producto?.nombre}
                          {det.personalizaciones && (
                            <span className="text-xs text-carbon-400 block ml-5 italic">- {det.personalizaciones}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
  
                  {/*acciones de validacion*/}
                  <div className="flex flex-col items-end gap-3 min-w-[250px]">
                    <p className="text-lg font-bold text-white">
                      Total: ${pedido.total.toLocaleString("es-CL")}
                    </p>
  
                    {pedido.metodoPago === "efectivo" ? (
                      <div className="w-full space-y-2">
                        <input
                          type="number"
                          placeholder="Monto recibido"
                          value={montosEfectivo[pedido.id] || ""}
                          onChange={(e) =>
                            setMontosEfectivo({
                              ...montosEfectivo,
                              [pedido.id]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 bg-carbon-900 border border-accent/20 rounded text-sm text-white focus:outline-none focus:border-brand-500"
                        />
                        <div className="flex justify-between text-xs text-carbon-300">
                          <span>Vuelto:</span>
                          <span className="font-semibold text-brand-400">
                            ${vueltoCalculado.toLocaleString("es-CL")}
                          </span>
                        </div>
                        <button
                          disabled={!alcanzaParaPagar || procesando}
                          onClick={() => handleValidarPago(pedido, vueltoCalculado)}
                          className="w-full py-2 bg-brand-500 text-carbon-900 font-bold rounded text-sm disabled:opacity-30 hover:bg-brand-400 transition"
                        >
                          {procesando ? "Procesando..." : "Validar y Entregar Vuelto"}
                        </button>
                      </div>
                    ) : (
                      /*transferencia*/
                      <button
                        disabled={procesando}
                        onClick={() => handleValidarPago(pedido)}
                        className="w-full py-2 bg-blue-500 text-white font-bold rounded text-sm hover:bg-blue-400 transition disabled:opacity-30"
                      >
                        {procesando ? "Procesando..." : "Confirmar Comprobante"}
                      </button>
                    )}
  
                    {/*boton de rechazar*/}
                    <button
                      disabled={procesando}
                      onClick={() => handleRechazarPago(pedido)}
                      className="w-full py-2 border border-estado-agotado text-estado-agotado font-bold rounded text-sm hover:bg-estado-agotado/10 transition disabled:opacity-30"
                    >
                      Rechazar pago
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  