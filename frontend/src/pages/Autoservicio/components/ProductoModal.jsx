import { useState } from "react";
import { useAutoservicio } from "../../../context/AutoservicioContext";
import { obtenerOpcionesDisponibles } from "../../../features/jornada/reglasDisponibilidad";
import MilkshakeForm from "./MilkshakeForm";
import JugoForm from "./JugoForm";
import FrappeForm from "./FrappeForm";
import SandwichForm from "./SandwichForm";
import { IconCerrar } from "../../../components/Icons";

const FORMULARIOS = {
  milkshake: MilkshakeForm,
  jugo: JugoForm,
  frappe: FrappeForm,
  sandwich: SandwichForm,
};

export default function ProductoModal({ producto, insumosJornada, onCerrar }) {
  const { agregarAlCarrito } = useAutoservicio();
  const [opciones, setOpciones] = useState({ resumen: "" });
  const [cantidad, setCantidad] = useState(1);

  const Formulario = FORMULARIOS[producto.tipo];
  const opcionesDisponibles = obtenerOpcionesDisponibles(insumosJornada);

  function aceptar() {
    agregarAlCarrito({
      id: `${producto.id}-${Date.now()}`,
      productoId: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      cantidad,
      precioUnitario: producto.precio,
      subtotal: producto.precio * cantidad,
      opciones,
    });
    onCerrar();
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-30 flex items-end md:items-center justify-center"
      onClick={onCerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          bg-carbon-800 border border-accent/30 rounded-t-card md:rounded-card
          w-full md:max-w-lg max-h-[85vh] overflow-y-auto
          p-6 flex flex-col gap-6
        "
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-display text-xl font-semibold">
              {producto.nombre}
            </h2>
            <span className="text-brand-400 font-semibold">
              ${producto.precio.toLocaleString("es-CL")}
            </span>
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full bg-carbon-700 text-white flex items-center justify-center"
          >
            <IconCerrar className="w-5 h-5" />
          </button>
        </div>

        {Formulario ? (
          <Formulario onCambiar={setOpciones} {...opcionesDisponibles} />
        ) : (
          <p className="text-carbon-300 text-sm">
            Este producto no requiere personalización adicional.
          </p>
        )}

        <div className="flex items-center justify-between bg-carbon-900 border border-carbon-600 rounded-card px-4 py-3">
          <span className="text-white text-sm font-semibold">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              aria-label="Quitar una unidad"
              className="w-9 h-9 rounded-full bg-carbon-700 text-white font-bold active:scale-90"
            >
              −
            </button>
            <span className="text-white w-6 text-center font-semibold text-lg">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad((c) => c + 1)}
              aria-label="Agregar una unidad"
              className="w-9 h-9 rounded-full bg-brand-500 text-carbon-900 font-bold active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={aceptar}
          className="
            min-h-touch-lg rounded-card bg-brand-500 text-white font-display font-semibold text-lg
            active:scale-95 transition-transform mt-2
          "
        >
          Aceptar{cantidad > 1 ? ` (${cantidad})` : ""}
        </button>
      </div>
    </div>
  );
}