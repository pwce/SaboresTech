// InsumosForm.jsx
import React, { useState } from "react";
import {
  ENVASES_CONFIG,
  LECHES_CONFIG,
  ENDULZANTES_CONFIG,
  CREMA_CONFIG,
  EXTRAS_CONFIG,
  obtenerLabelInsumo,
  agregarInsumoPersonalizado,
} from "./jornada.config";

function ToggleChip({ activo, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold border transition-colors min-h-touch
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
      <div className="flex flex-wrap gap-2 items-center">{children}</div>
    </div>
  );
}

function AgregarPersonalizado({ placeholder, onAgregar }) {
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState("");

  const confirmar = () => {
    if (!valor.trim()) return;
    onAgregar(valor.trim());
    setValor("");
    setAbierto(false);
  };

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold border border-dashed border-brand-400 text-brand-400 min-h-touch"
      >
        + Agregar otra
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && confirmar()}
        className="bg-carbon-900 border border-carbon-600 rounded-lg px-3 py-2 text-white text-sm w-36"
      />
      <button
        type="button"
        onClick={confirmar}
        className="px-3 py-2 rounded-lg bg-brand-500 text-carbon-900 text-sm font-semibold min-h-touch"
      >
        Agregar
      </button>
      <button
        type="button"
        onClick={() => { setAbierto(false); setValor(""); }}
        className="text-carbon-400 text-sm px-2"
      >
        Cancelar
      </button>
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
    const num = Math.min(1000, Math.max(0, Number(valor) || 0));
    onChange({ ...insumos, envases: { ...insumos.envases, [key]: num } });
  };

  const agregarFruta = (nombreLibre) => {
    onChange(agregarInsumoPersonalizado(insumos, "frutas", nombreLibre));
  };

  const frutasKeys = Object.keys(insumos.frutas || {});

  return (
    <div>
      <Seccion titulo="Envases (define si se pueden vender bebestibles)">
        {ENVASES_CONFIG.map((e) => (
          <div key={e.key} className="flex items-center gap-2 bg-carbon-800 border border-carbon-600 rounded-lg px-3 py-2 sm:px-4">
            <label className="text-sm text-carbon-200 font-semibold">{e.label}</label>
            <input
              type="number"
              min="0"
              max="1000"
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
        {frutasKeys.map((key) => (
          <ToggleChip
            key={key}
            label={obtenerLabelInsumo("frutas", key, insumos)}
            activo={insumos.frutas[key]}
            onClick={() => toggle("frutas", key)}
          />
        ))}
        <AgregarPersonalizado placeholder="Ej: Kiwi" onAgregar={agregarFruta} />
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
