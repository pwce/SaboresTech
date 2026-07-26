import { useAutoservicio, PASOS } from "../../context/AutoservicioContext";
import { IconEliminar } from "../../components/Icons";

export default function CarritoScreen() {
  const { carrito, actualizarCantidad, eliminarItem, total, setPaso } = useAutoservicio();

  return (
    <div className="min-h-screen bg-carbon-900 flex flex-col">
      <header className="p-6 border-b border-accent/20 flex items-center gap-4">
        <button
          onClick={() => setPaso(PASOS.MENU)}
          className="text-carbon-300 text-2xl"
          aria-label="Volver al menú"
        >
          ←
        </button>
        <h1 className="text-white font-display text-2xl font-semibold">
          Tu pedido
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {carrito.length === 0 && (
          <p className="text-carbon-300 text-center mt-10">Tu carrito está vacío.</p>
        )}

        {carrito.map((item) => (
          <div
            key={item.id}
            className="bg-carbon-800 border border-accent/20 rounded-card p-4 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-display font-medium">{item.nombre}</p>
                {item.opciones?.resumen && (
                  <p className="text-carbon-300 text-xs mt-1">{item.opciones.resumen}</p>
                )}
              </div>
              <button
                onClick={() => eliminarItem(item.id)}
                aria-label={`Eliminar ${item.nombre}`}
                className="w-9 h-9 flex items-center justify-center rounded-card border border-carbon-600 text-carbon-300 hover:text-estado-agotado hover:border-estado-agotado transition-colors shrink-0"
              >
                <IconEliminar className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => actualizarCantidad(item.id, -1)}
                  className="w-9 h-9 rounded-full bg-carbon-700 text-white font-bold active:scale-90"
                >
                  −
                </button>
                <span className="text-white w-6 text-center">{item.cantidad}</span>
                <button
                  onClick={() => actualizarCantidad(item.id, 1)}
                  className="w-9 h-9 rounded-full bg-brand-500 text-white font-bold active:scale-90"
                >
                  +
                </button>
              </div>
              <span className="text-brand-400 font-semibold">
                ${item.subtotal.toLocaleString("es-CL")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-accent/20 flex flex-col gap-4">
        <div className="flex justify-between text-white font-display text-lg">
          <span>Total</span>
          <span>${total.toLocaleString("es-CL")}</span>
        </div>
        <button
          disabled={carrito.length === 0}
          onClick={() => setPaso(PASOS.PAGO)}
          className="
            min-h-touch-lg rounded-card bg-brand-500 text-white font-display font-bold text-xl
            active:scale-95 transition-transform disabled:opacity-40
          "
        >
          Confirmar y Pagar
        </button>
      </div>
    </div>
  );
}