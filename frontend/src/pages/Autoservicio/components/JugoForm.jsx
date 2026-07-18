import { useState } from "react";
import { FRUTAS_CONFIG, ENDULZANTES_CONFIG } from "../../../features/jornada/jornada.config";

const MAX_FRUTAS = 2;

export default function JugoForm({ onCambiar, frutasDisponibles, endulzantesDisponibles }) {
  const frutasOpciones = frutasDisponibles ?? [];
  const endulzantesOpciones = endulzantesDisponibles ?? [];

  const [endulzante, setEndulzante] = useState(endulzantesOpciones[0]?.key ?? "");
  const [frutas, setFrutas] = useState([]);

  function toggleFruta(frutaKey) {
    let nuevas;
    if (frutas.includes(frutaKey)) {
      nuevas = frutas.filter((f) => f !== frutaKey);
    } else {
      if (frutas.length >= MAX_FRUTAS) return;
      nuevas = [...frutas, frutaKey];
    }
    setFrutas(nuevas);
    emitir(endulzante, nuevas);
  }

  function emitir(end, frutKeys) {
    const nombresFrutas = frutKeys.map((key) => {
      const encontrada = FRUTAS_CONFIG.find((f) => f.key === key);
      return encontrada ? encontrada.label : key;
    });
    const endLabel = ENDULZANTES_CONFIG.find((e) => e.key === end)?.label || end || "sin endulzante";

    onCambiar({
      endulzante: end,
      frutas: frutKeys,
      resumen: `Base de agua, ${endLabel}, ${
        nombresFrutas.length ? nombresFrutas.join(" + ") : "elige tu(s) fruta(s)"
      }`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-carbon-300 text-sm italic">A base de agua.</p>

      <fieldset>
        <legend className="text-white font-medium mb-2">Endulzante</legend>
        <div className="flex gap-3 flex-wrap">
          {endulzantesOpciones.length === 0 && (
            <p className="text-carbon-400 text-sm italic">No hay endulzante disponible hoy.</p>
          )}
          {endulzantesOpciones.map((op) => (
            <button
              key={op.key}
              type="button"
              onClick={() => {
                setEndulzante(op.key);
                emitir(op.key, frutas);
              }}
              className={`px-4 py-2 rounded-full border capitalize text-sm min-h-touch
                ${
                  endulzante === op.key
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "border-accent/40 text-carbon-300"
                }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-white font-medium mb-2">
          Frutas (elige 1 o {MAX_FRUTAS})
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
