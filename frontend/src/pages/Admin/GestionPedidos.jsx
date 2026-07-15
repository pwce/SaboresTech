// GestionPedidos.jsx
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function GestionPedidos() {
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
      await axiosClient.put(`/v1/pedidos/${pedidoId}/estado-cocina`, {
        estadoCocina: nuevoEstado,
      });
      setPedidos((prev) =>
        prev
          .map((p) => (p.id === pedidoId ? { ...p, estadoCocina: nuevoEstado } : p))
          .filter((p) => p.estadoCocina !== "entregado")
      );
    } catch (error) {
      alert("No se pudo actualizar el estado de la cocina");
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
        {/* Columna: En Preparación */}
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

        {/* Columna: Listos para entregar */}
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
            Jornada N° {pedido.numeroJornada}
          </h3>
          <span className="text-xs text-carbon-400">
            Hace {calcularTiempoTranscurrido(pedido.createdAt)} min
          </span>
        </div>
        <p className="text-xs text-carbon-500">ID: {pedido.id}</p>

        {/* Lista de productos */}
        <div className="mt-3 space-y-1.5">
          {pedido.detalles?.map((det, idx) => (
            <p key={idx} className="text-sm text-carbon-200">
              <span className="font-semibold text-brand-400">{det.cantidad}x</span> {det.producto?.nombre}
              {det.personalizaciones && (
                <span className="text-xs text-carbon-400 block ml-5 italic">
                  - {det.personalizaciones}
                </span>
              )}
            </p>
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