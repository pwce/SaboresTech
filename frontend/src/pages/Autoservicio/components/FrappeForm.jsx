import { useState } from "react";
import { LECHES_CONFIG, ENDULZANTES_CONFIG } from "../../../features/jornada/jornada.config";

const OPCION_SIN_NADA = { key: "ninguno", label: "Sin nada" };

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

export default function FrappeForm({ onCambiar, lechesDisponibles, endulzantesDisponibles }) {
  const lechesOpciones = lechesDisponibles ?? [];
  const endulzantesOpciones = [...(endulzantesDisponibles ?? []), OPCION_SIN_NADA];

  const [crema, setCrema] = useState("si");
  const [tipoLeche, setTipoLeche] = useState(lechesOpciones[0]?.key ?? "");
  const [salsa, setSalsa] = useState("no");
  const [endulzante, setEndulzante] = useState(OPCION_SIN_NADA.key);

  function emitir(overrides = {}) {
    const estado = { crema, tipoLeche, salsa, endulzante, ...overrides };
    const lecheLabel = LECHES_CONFIG.find((l) => l.key === estado.tipoLeche)?.label || estado.tipoLeche;
    const endLabel = estado.endulzante === OPCION_SIN_NADA.key
      ? "sin endulzante"
      : (ENDULZANTES_CONFIG.find((e) => e.key === estado.endulzante)?.label || estado.endulzante);

    onCambiar({
      ...estado,
      resumen: `Crema: ${estado.crema === "si" ? "sí" : "no"} · ${lecheLabel} · Salsa: ${estado.salsa === "si" ? "sí" : "no"} · ${endLabel}`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <SiNoToggle label="¿Con crema batida?" valor={crema} onChange={(v) => { setCrema(v); emitir({ crema: v }); }} />

      <fieldset>
        <legend className="text-white font-medium mb-2">Tipo de leche</legend>
        <div className="flex gap-3 flex-wrap">
          {lechesOpciones.length === 0 && (
            <p className="text-carbon-400 text-sm italic">No hay leche disponible hoy.</p>
          )}
          {lechesOpciones.map((op) => (
            <button
              key={op.key}
              type="button"
              onClick={() => { setTipoLeche(op.key); emitir({ tipoLeche: op.key }); }}
              className={`px-4 py-2 rounded-full border text-sm min-h-touch
                ${tipoLeche === op.key ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </fieldset>

      <SiNoToggle label="¿Con salsa?" valor={salsa} onChange={(v) => { setSalsa(v); emitir({ salsa: v }); }} />

      <fieldset>
        <legend className="text-white font-medium mb-2">Endulzante</legend>
        <div className="flex gap-3 flex-wrap">
          {endulzantesOpciones.map((op) => (
            <button
              key={op.key}
              type="button"
              onClick={() => { setEndulzante(op.key); emitir({ endulzante: op.key }); }}
              className={`px-4 py-2 rounded-full border text-sm min-h-touch
                ${endulzante === op.key ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}