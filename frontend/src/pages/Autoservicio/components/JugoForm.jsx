import { useState } from "react";
import { FRUTAS_DISPONIBLES } from "../data/productos.mock";

const MAX_FRUTAS = 2;

export default function JugoForm({ onCambiar }) {
  const [endulzante, setEndulzante] = useState("azucar");
  const [frutas, setFrutas] = useState([]);

  function toggleFruta(fruta) {
    setFrutas((prev) => {
      let nuevas;
      if (prev.includes(fruta)) {
        nuevas = prev.filter((f) => f !== fruta);
      } else {
        if (prev.length >= MAX_FRUTAS) return prev;
        nuevas = [...prev, fruta];
      }
      emitir(endulzante, nuevas);
      return nuevas;
    });
  }

  function emitir(end, frut) {
    onCambiar({
      endulzante: end,
      frutas: frut,
      resumen: `Base de agua, ${end}, ${frut.length ? frut.join(" + ") : "elige tu(s) fruta(s)"}`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-carbon-300 text-sm italic">
        A base de agua — sin opción de leche.
      </p>

      <fieldset>
        <legend className="text-white font-medium mb-2">Endulzante</legend>
        <div className="flex gap-3">
          {["azucar", "endulzante"].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => { setEndulzante(op); emitir(op, frutas); }}
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
          Frutas (elige 1 o {MAX_FRUTAS})
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {FRUTAS_DISPONIBLES.map((fruta) => {
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
