// SandwichForm.jsx
import { useState } from "react";

export default function SandwichForm({ onCambiar }) {
  const [salsa, setSalsa] = useState("no");

  function emitir(overrides = {}) {
    const estado = { salsa, ...overrides };
    onCambiar({
      ...estado,
      resumen: `Salsa: ${estado.salsa === "si" ? "sí" : "no"}`,
    });
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
    </div>
  );
}