
export default function CategoriaTabs({ categorias, activa, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-4 bg-carbon-900 sticky top-0 z-10 border-b border-accent/20">
      {categorias.map((cat) => {
        const seleccionada = cat.id === activa;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              min-h-touch px-6 rounded-full font-display font-medium text-sm whitespace-nowrap
              transition-colors border
              ${seleccionada
                ? "bg-brand-500 border-brand-500 text-white shadow-pop"
                : "bg-transparent border-accent/40 text-carbon-300 hover:border-accent"}
            `}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
