// MilkshakeForm.jsx
import { useState } from "react";
import { FRUTAS_CONFIG, LECHES_CONFIG, ENDULZANTES_CONFIG } from "../../../features/jornada/jornada.config";

const MAX_FRUTAS = 2;
const OPCION_SIN_NADA = { key: "ninguno", label: "Sin nada" };

export default function MilkshakeForm({ onCambiar, frutasDisponibles, lechesDisponibles, endulzantesDisponibles }) {
  const frutasOpciones = frutasDisponibles ?? [];
  const lechesOpciones = lechesDisponibles ?? [];
  const endulzantesOpciones = [...(endulzantesDisponibles ?? []), OPCION_SIN_NADA];

  const [tipoLeche, setTipoLeche] = useState(lechesOpciones[0]?.key ?? "");
  const [endulzante, setEndulzante] = useState(OPCION_SIN_NADA.key);
  const [frutas, setFrutas] = useState([]);

  function toggleFruta(frutaKey) {
    setFrutas((prev) => {
      let nuevas;
      if (prev.includes(frutaKey)) {
        nuevas = prev.filter((f) => f !== frutaKey);
      } else {
        if (prev.length >= MAX_FRUTAS) return prev; 
        nuevas = [...prev, frutaKey];
      }
      emitir(tipoLeche, endulzante, nuevas);
      return nuevas;
    });
  }

  function emitir(leche, end, frutKeys) {
    const nombresFrutas = frutKeys.map((key) => {
      const encontrada = FRUTAS_CONFIG.find((f) => f.key === key);
      return encontrada ? encontrada.label : key;
    });
    const lecheLabel = LECHES_CONFIG.find((l) => l.key === leche)?.label || leche;
    const endLabel = end === OPCION_SIN_NADA.key ? "sin endulzante" : (ENDULZANTES_CONFIG.find((e) => e.key === end)?.label || end);

    onCambiar({
      tipoLeche: leche,
      endulzante: end,
      frutas: frutKeys,
      resumen: `${lecheLabel}, ${endLabel}, ${nombresFrutas.length ? nombresFrutas.join(" + ") : "sin fruta"}`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
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
              onClick={() => { setTipoLeche(op.key); emitir(op.key, endulzante, frutas); }}
              className={`px-4 py-2 rounded-full border text-sm min-h-touch
                ${tipoLeche === op.key ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-white font-medium mb-2">Endulzante</legend>
        <div className="flex gap-3 flex-wrap">
          {endulzantesOpciones.map((op) => (
            <button
              key={op.key}
              type="button"
              onClick={() => { setEndulzante(op.key); emitir(tipoLeche, op.key, frutas); }}
              className={`px-4 py-2 rounded-full border text-sm min-h-touch
                ${endulzante === op.key ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-white font-medium mb-2">
          Frutas (hasta {MAX_FRUTAS})
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {frutasOpciones.length === 0 && (
            <p className="text-carbon-400 text-sm italic col-span-2">No hay fruta disponible hoy.</p>
          )}
          {frutasOpciones.map((fruta) => {
            const marcada = frutas.includes(fruta.key);
            const deshabilitada = !marcada && frutas.length >= MAX_FRUTAS;
            return (
              <label
                key={fruta.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border min-h-touch
                  ${marcada ? "border-brand-500 bg-brand-500/10" : "border-accent/20"}
                  ${deshabilitada ? "opacity-40" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={marcada}
                  disabled={deshabilitada}
                  onChange={() => toggleFruta(fruta.key)}
                  className="accent-brand-500 w-4 h-4"
                />
                <span className="text-white text-sm">{fruta.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}