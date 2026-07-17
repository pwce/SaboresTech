// GestionPedidos.jsx
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";

export default function GestionPedidos() {
  const mostrarToast = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const obtenerPedidosActivos = async () => {
    try {
      const res = await axiosClient.get("/v1/pedidos");
      const activos = res.data.data.filter(
        (p) =>
          p.estadoPago === "validado" &&
          (p.estadoCocina === "en_preparacion" || p.estadoCocina === "listo")
      );
      setPedidos(activos);
    } catch (error) {
      console.error("Error al obtener pedidos activos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPedidosActivos();
    const interval = setInterval(obtenerPedidosActivos, 5000);
    return () => clearInterval(interval);
  }, []);

  const cambiarEstadoCocina = async (pedidoId, nuevoEstado) => {
    try {
      await axiosClient.put(`/v1/pedidos/${pedidoId}/estado`, {
        nuevoEstado,
      });
      setPedidos((prev) =>
        prev
          .map((p) => (p.id === pedidoId ? { ...p, estadoCocina: nuevoEstado } : p))
          .filter((p) => p.estadoCocina !== "entregado")
      );
    } catch (error) {
      mostrarToast("No se pudo actualizar el estado de la cocina", "error");
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-10">Cargando cola de pedidos...</div>;
  }

  const enPreparacion = pedidos.filter((p) => p.estadoCocina === "en_preparacion");
  const listos = pedidos.filter((p) => p.estadoCocina === "listo");

  return (
    <div className="p-6 bg-carbon-900 min-h-screen text-white">
      <header className="mb-8">
        <h1 className="text-2xl font-bold font-display text-brand-400">
          Monitor de Pedidos y Cocina
        </h1>
        <p className="text-carbon-300 text-sm">
          Controla la preparación y las entregas del local.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-orange-500/30 pb-2 text-orange-400">
            En Preparación ({enPreparacion.length})
          </h2>
          {enPreparacion.length === 0 ? (
            <p className="text-carbon-500 text-sm italic">No hay pedidos preparándose.</p>
          ) : (
            enPreparacion.map((p) => (
              <TarjetaPedido
                key={p.id}
                pedido={p}
                accionLabel="Marcar como Listo"
                accionColor="bg-orange-500 hover:bg-orange-400"
                onAccion={() => cambiarEstadoCocina(p.id, "listo")}
              />
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-green-500/30 pb-2 text-green-400">
            Listos para entregar ({listos.length})
          </h2>
          {listos.length === 0 ? (
            <p className="text-carbon-500 text-sm italic">No hay pedidos esperando entrega.</p>
          ) : (
            listos.map((p) => (
              <TarjetaPedido
                key={p.id}
                pedido={p}
                accionLabel="Entregar Pedido"
                accionColor="bg-green-500 hover:bg-green-400 text-carbon-900 font-bold"
                onAccion={() => cambiarEstadoCocina(p.id, "entregado")}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TarjetaPedido({ pedido, accionLabel, accionColor, onAccion }) {
  return (
    <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4 flex flex-col justify-between gap-4">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-white text-lg font-bold">
            Pedido N° {pedido.numeroJornada}
          </h3>
          <span className="text-xs text-carbon-400">
            Hace {calcularTiempoTranscurrido(pedido.fecha)} min
          </span>
        </div>
        {pedido.tipoServicio && (
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${
              pedido.tipoServicio === "llevar"
                ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                : "bg-teal-500/10 text-teal-300 border border-teal-500/20"
            }`}
          >
            {pedido.tipoServicio === "llevar" ? "Para llevar" : "Para comer aquí"}
          </span>
        )}

        {/*lista de productos*/}
        <div className="mt-3 space-y-2">
          {pedido.productos?.map((det, idx) => (
            <div key={idx} className="bg-carbon-900 border border-carbon-700 rounded-lg p-2.5">
              <p className="text-sm text-white font-semibold">
                <span className="text-brand-400">{det.cantidad}x</span> {det.producto?.nombre}
              </p>

              {det.personalizaciones && (
                <div className="mt-1.5 bg-brand-500/10 border border-brand-500/30 rounded px-2.5 py-1.5">
                  <p className="text-xs font-bold text-brand-300 uppercase tracking-wide mb-0.5">
                    Personalización
                  </p>
                  <p className="text-sm text-white font-medium">{det.personalizaciones}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onAccion}
        className={`w-full py-2.5 rounded font-bold text-sm transition-transform active:scale-95 ${accionColor}`}
      >
        {accionLabel}
      </button>
    </div>
  );
}

function calcularTiempoTranscurrido(fechaStr) {
  const inicio = new Date(fechaStr);
  const ahora = new Date();
  const diffMs = ahora - inicio;
  return Math.floor(diffMs / 60000);
}