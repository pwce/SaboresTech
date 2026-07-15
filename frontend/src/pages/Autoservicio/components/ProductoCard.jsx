// ProductoCard.jsx
export default function ProductoCard({ producto, onAgregar }) {
  
    return (
    <div className="relative bg-carbon-800 rounded-card border border-accent/20 overflow-hidden flex flex-col">
      {/*marcador visual de foto*/}
      <div className="aspect-square bg-carbon-700 flex items-center justify-center text-carbon-300 text-sm">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <span>Sin foto</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1">
        <span className="text-white font-display font-medium leading-snug">
          {producto.nombre}
        </span>
        <span className="text-brand-400 font-semibold">
          ${producto.precio.toLocaleString("es-CL")}
        </span>
      </div>

      <button
        onClick={() => onAgregar(producto)}
        aria-label={`Agregar ${producto.nombre}`}
        className="
          absolute bottom-4 right-4 w-12 h-12 rounded-full bg-accent text-carbon-900
          text-2xl font-bold flex items-center justify-center shadow-pop
          active:scale-90 transition-transform
        "
      >
        +
      </button>
    </div>
  );
}
