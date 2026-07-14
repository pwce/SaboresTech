import React from "react";
import {
  ENVASES_CONFIG,
  LECHES_CONFIG,
  FRUTAS_CONFIG,
  ENDULZANTES_CONFIG,
  CREMA_CONFIG,
  EXTRAS_CONFIG,
} from "./jornada.config";

function ToggleChip({ activo, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors min-h-touch
        ${
          activo
            ? "bg-brand-500 border-brand-500 text-carbon-900"
            : "bg-carbon-800 border-carbon-600 text-carbon-200 hover:border-brand-400"
        }`}
    >
      {label}
    </button>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div className="mb-6">
      <h4 className="font-display font-semibold text-brand-300 mb-3">{titulo}</h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function InsumosForm({ insumos, onChange }) {
  const toggle = (grupo, key) => {
    onChange({
      ...insumos,
      [grupo]: { ...insumos[grupo], [key]: !insumos[grupo][key] },
    });
  };

  const cambiarEnvase = (key, valor) => {
    const num = Math.max(0, Number(valor) || 0);
    onChange({ ...insumos, envases: { ...insumos.envases, [key]: num } });
  };

  return (
    <div>
      <Seccion titulo="Envases (define si se pueden vender bebestibles)">
        {ENVASES_CONFIG.map((e) => (
          <div key={e.key} className="flex items-center gap-2 bg-carbon-800 border border-carbon-600 rounded-full px-4 py-2">
            <label className="text-sm text-carbon-200 font-semibold">{e.label}</label>
            <input
              type="number"
              min="0"
              value={insumos.envases[e.key]}
              onChange={(ev) => cambiarEnvase(e.key, ev.target.value)}
              className="w-16 bg-carbon-900 border border-carbon-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        ))}
      </Seccion>

      <Seccion titulo="Leche">
        {LECHES_CONFIG.map((l) => (
          <ToggleChip
            key={l.key}
            label={l.label}
            activo={insumos.leches[l.key]}
            onClick={() => toggle("leches", l.key)}
          />
        ))}
      </Seccion>

      <Seccion titulo="Frutas">
        {FRUTAS_CONFIG.map((f) => (
          <ToggleChip
            key={f.key}
            label={f.label}
            activo={insumos.frutas[f.key]}
            onClick={() => toggle("frutas", f.key)}
          />
        ))}
      </Seccion>

      <Seccion titulo="Endulzantes">
        {ENDULZANTES_CONFIG.map((e) => (
          <ToggleChip
            key={e.key}
            label={e.label}
            activo={insumos.endulzantes[e.key]}
            onClick={() => toggle("endulzantes", e.key)}
          />
        ))}
      </Seccion>

      <Seccion titulo="Crema">
        {CREMA_CONFIG.map((c) => (
          <ToggleChip
            key={c.key}
            label={c.label}
            activo={insumos.crema[c.key]}
            onClick={() => toggle("crema", c.key)}
          />
        ))}
      </Seccion>

      <Seccion titulo="Otros insumos">
        {EXTRAS_CONFIG.map((e) => (
          <ToggleChip
            key={e.key}
            label={e.label}
            activo={insumos.extras[e.key]}
            onClick={() => toggle("extras", e.key)}
          />
        ))}
      </Seccion>
    </div>
  );
}
