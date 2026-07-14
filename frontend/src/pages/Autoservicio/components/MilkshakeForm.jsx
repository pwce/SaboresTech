import { useState } from "react";
import { FRUTAS_CONFIG } from "../../../features/jornada/jornada.config";

const MAX_FRUTAS = 2;

export default function MilkshakeForm({ onCambiar }) {
  const [tipoLeche, setTipoLeche] = useState("natural");
  const [endulzante, setEndulzante] = useState("azucar");
  const [frutas, setFrutas] = useState([]);

  function toggleFruta(fruta) {
    setFrutas((prev) => {
      let nuevas;
      if (prev.includes(fruta)) {
        nuevas = prev.filter((f) => f !== fruta);
      } else {
        if (prev.length >= MAX_FRUTAS) return prev; // no deja pasar de 2
        nuevas = [...prev, fruta];
      }
      emitir(tipoLeche, endulzante, nuevas);
      return nuevas;
    });
  }

  function emitir(leche, end, frut) {
    onCambiar({
      tipoLeche: leche,
      endulzante: end,
      frutas: frut,
      resumen: `Leche ${leche}, ${end}, ${frut.length ? frut.join(" + ") : "sin fruta"}`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="text-white font-medium mb-2">Tipo de leche</legend>
        <div className="flex gap-3">
          {["natural", "deslactosada"].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => { setTipoLeche(op); emitir(op, endulzante, frutas); }}
              className={`px-4 py-2 rounded-full border capitalize text-sm min-h-touch
                ${tipoLeche === op ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-white font-medium mb-2">Endulzante</legend>
        <div className="flex gap-3">
          {["azucar", "endulzante"].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => { setEndulzante(op); emitir(tipoLeche, op, frutas); }}
              className={`px-4 py-2 rounded-full border capitalize text-sm min-h-touch
                ${endulzante === op ? "bg-brand-500 border-brand-500 text-white" : "border-accent/40 text-carbon-300"}`}
            >
              {op}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-white font-medium mb-2">
          Frutas (hasta {MAX_FRUTAS})
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {FRUTAS_CONFIG.map((fruta) => {
            const marcada = frutas.includes(fruta);
            const deshabilitada = !marcada && frutas.length >= MAX_FRUTAS;
            return (
              <label
                key={fruta}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border min-h-touch
                  ${marcada ? "border-brand-500 bg-brand-500/10" : "border-accent/20"}
                  ${deshabilitada ? "opacity-40" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={marcada}
                  disabled={deshabilitada}
                  onChange={() => toggleFruta(fruta)}
                  className="accent-brand-500 w-4 h-4"
                />
                <span className="text-white text-sm">{fruta}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
