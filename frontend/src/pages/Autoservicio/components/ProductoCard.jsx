// ProductoCard.jsx
export default function ProductoCard({ producto, onAgregar }) {
  
    return (
    <div className="bg-carbon-800 rounded-card border border-accent/20 overflow-hidden flex flex-col">
      {/*marcador visual de foto*/}
      <div className="aspect-square bg-carbon-700 flex items-center justify-center text-carbon-300 text-sm">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <span>Sin foto</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-white font-display font-medium leading-snug">
          {producto.nombre}
        </span>

        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <span className="text-brand-400 font-semibold">
            ${producto.precio.toLocaleString("es-CL")}
          </span>

          <button
            onClick={() => onAgregar(producto)}
            aria-label={`Agregar ${producto.nombre}`}
            className="
              w-9 h-9 shrink-0 rounded-full bg-accent text-carbon-900
              text-xl font-bold flex items-center justify-center shadow-pop
              active:scale-90 transition-transform
            "
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}