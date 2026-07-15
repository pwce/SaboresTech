// CarritoFlotante.jsx
import { useAutoservicio, PASOS } from "../../../context/AutoservicioContext";

export default function CarritoFlotante() {
  const { total, cantidadItems, setPaso } = useAutoservicio();

  if (cantidadItems === 0) return null;

  return (
    <button
      onClick={() => setPaso(PASOS.CARRITO)}
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2 z-20
        bg-brand-500 text-white rounded-full shadow-pop
        px-8 min-h-touch-lg flex items-center gap-3
        font-display font-semibold text-lg
        active:scale-95 transition-transform
      "
    >
      <span>Ver Pedido</span>
      <span className="w-px h-6 bg-white/30" />
      <span>Total: ${total.toLocaleString("es-CL")}</span>
    </button>
  );
}
