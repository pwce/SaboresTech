import { useState } from "react";

export default function SandwichForm({ onCambiar }) {
  const [salsa, setSalsa] = useState("no");
  const [cantidad, setCantidad] = useState(1);

  function emitir(overrides = {}) {
    const estado = { salsa, cantidad, ...overrides };
    onCambiar({
      ...estado,
      resumen: `Salsa: ${estado.salsa === "si" ? "sí" : "no"}`,
    });
  }

  function cambiarCantidad(delta) {
    const nueva = Math.max(1, cantidad + delta);
    setCantidad(nueva);
    emitir({ cantidad: nueva });
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="text-white font-medium mb-2">¿Agregar salsa?</legend>
        <div className="flex gap-3">
          {[["si", "Sí"], ["no", "No"]].map(([val, txt]) => (
            <button
              key={val}
              type="button"
              onClick={() => { setSalsa(val); emitir({ salsa: val }); }}
              className={`px-5 py-2 rounded-full border text-sm min-h-touch
                ${salsa === val ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {txt}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-white font-medium mb-2">Cantidad</legend>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => cambiarCantidad(-1)}
            className="w-12 h-12 rounded-full bg-carbon-700 text-white text-xl font-bold active:scale-90"
          >
            −
          </button>
          <span className="text-white text-2xl font-display w-8 text-center">{cantidad}</span>
          <button
            type="button"
            onClick={() => cambiarCantidad(1)}
            className="w-12 h-12 rounded-full bg-brand-500 text-white text-xl font-bold active:scale-90"
          >
            +
          </button>
        </div>
      </fieldset>
    </div>
  );
}
