import { useEffect, useMemo, useState } from "react";

function formatearFechaInput(fecha) {
  const d = new Date(fecha);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function etiquetaJornada(j) {
  const hora = new Date(j.fechaInicio).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  return j.activa ? `Jornada actual (desde las ${hora})` : `Jornada desde las ${hora}`;
}


export default function SelectorJornadaPorFecha({ jornadas, jornadaId, onChange }) {
  const jornadaActiva = jornadas.find((j) => j.activa);
  const jornadaSeleccionada = jornadas.find((j) => j.id === jornadaId);

  const [fecha, setFecha] = useState(() =>
    formatearFechaInput(jornadaSeleccionada?.fechaInicio || jornadaActiva?.fechaInicio || new Date())
  );

  const jornadasDelDia = useMemo(
    () => jornadas.filter((j) => formatearFechaInput(j.fechaInicio) === fecha),
    [jornadas, fecha]
  );

  useEffect(() => {
    if (jornadasDelDia.length > 0 && !jornadasDelDia.some((j) => j.id === jornadaId)) {
      onChange(jornadasDelDia[0].id);
    }
  }, [fecha, jornadasDelDia]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-sm text-carbon-300 mb-1 block">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="px-3 py-2 bg-carbon-800 border border-carbon-700 rounded text-white text-sm"
        />
      </div>

      <div className="min-w-[220px]">
        <label className="text-sm text-carbon-300 mb-1 block">Jornada de ese día</label>
        <select
          value={jornadaId ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded text-white text-sm"
        >
          {jornadasDelDia.length === 0 && <option value="">Sin jornadas ese día</option>}
          {jornadasDelDia.map((j) => (
            <option key={j.id} value={j.id}>{etiquetaJornada(j)}</option>
          ))}
        </select>
      </div>

      {jornadaActiva && jornadaActiva.id !== jornadaId && (
        <button
          type="button"
          onClick={() => {
            setFecha(formatearFechaInput(jornadaActiva.fechaInicio));
            onChange(jornadaActiva.id);
          }}
          className="px-3 py-2 rounded-full text-xs font-semibold border border-brand-500 text-brand-400 hover:bg-brand-500/10"
        >
          Ir a la jornada actual
        </button>
      )}
    </div>
  );
}
