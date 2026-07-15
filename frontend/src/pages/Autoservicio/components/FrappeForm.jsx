// FrappeForm.jsx
import { useState } from "react";

const SiNoToggle = ({ label, valor, onChange }) => (
  <fieldset>
    <legend className="text-white font-medium mb-2">{label}</legend>
    <div className="flex gap-3">
      {[["si", "Sí"], ["no", "No"]].map(([val, txt]) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`px-5 py-2 rounded-full border text-sm min-h-touch
            ${valor === val ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
        >
          {txt}
        </button>
      ))}
    </div>
  </fieldset>
);

export default function FrappeForm({ onCambiar }) {
  const [crema, setCrema] = useState("si");
  const [tipoLeche, setTipoLeche] = useState("natural");
  const [salsa, setSalsa] = useState("no");
  const [endulzante, setEndulzante] = useState("azucar");

  function emitir(overrides = {}) {
    const estado = { crema, tipoLeche, salsa, endulzante, ...overrides };
    onCambiar({
      ...estado,
      resumen: `Crema: ${estado.crema === "si" ? "sí" : "no"} · Leche ${estado.tipoLeche} · Salsa: ${estado.salsa === "si" ? "sí" : "no"} · ${estado.endulzante}`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <SiNoToggle label="¿Con crema batida?" valor={crema} onChange={(v) => { setCrema(v); emitir({ crema: v }); }} />

      <fieldset>
        <legend className="text-white font-medium mb-2">Tipo de leche</legend>
        <div className="flex gap-3">
          {["natural", "deslactosada"].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => { setTipoLeche(op); emitir({ tipoLeche: op }); }}
              className={`px-4 py-2 rounded-full border capitalize text-sm min-h-touch
                ${tipoLeche === op ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op}
            </button>
          ))}
        </div>
      </fieldset>

      <SiNoToggle label="¿Con salsa?" valor={salsa} onChange={(v) => { setSalsa(v); emitir({ salsa: v }); }} />

      <fieldset>
        <legend className="text-white font-medium mb-2">Endulzante</legend>
        <div className="flex gap-3">
          {["azucar", "endulzante"].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => { setEndulzante(op); emitir({ endulzante: op }); }}
              className={`px-4 py-2 rounded-full border capitalize text-sm min-h-touch
                ${endulzante === op ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
