// GestionCaja.jsx
import { useEffect, useState } from "react";
import { obtenerJornadas } from "../../api/gastos.service";
import { obtenerCajaPorJornada, abrirCaja, cerrarCaja, obtenerHistorialCajas } from "../../api/caja.service";
import Modal from "../../components/Modal";

function etiquetaJornada(j) {
  const inicio = new Date(j.fechaInicio).toLocaleDateString("es-CL");
  return j.activa ? `Jornada actual (desde ${inicio})` : `Jornada del ${inicio}`;
}

function formatoMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
}

export default function GestionCaja() {
  const [jornadas, setJornadas] = useState([]);
  const [jornadaId, setJornadaId] = useState(null);
  const [caja, setCaja] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [historial, setHistorial] = useState([]);

  const [modalAbrir, setModalAbrir] = useState(false);
  const [saldoInicialInput, setSaldoInicialInput] = useState("");

  const [modalCerrar, setModalCerrar] = useState(false);
  const [saldoContadoInput, setSaldoContadoInput] = useState("");

  useEffect(() => {
    (async () => {
      const lista = await obtenerJornadas();
      setJornadas(lista);
      const activa = lista.find((j) => j.activa);
      setJornadaId(activa ? activa.id : lista[0]?.id ?? null);
      setHistorial(await obtenerHistorialCajas());
    })();
  }, []);

  const cargarCaja = async () => {
    if (!jornadaId) return;
    setCargando(true);
    try {
      setCaja(await obtenerCajaPorJornada(jornadaId));
    } catch (error) {
      console.error("Error al consultar la caja:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCaja();
    const interval = setInterval(cargarCaja, 5000);
    return () => clearInterval(interval);
  }, [jornadaId]);

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      await abrirCaja(jornadaId, Number(saldoInicialInput));
      setModalAbrir(false);
      setSaldoInicialInput("");
      cargarCaja();
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al abrir la caja");
    } finally {
      setProcesando(false);
    }
  };

  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const resultado = await cerrarCaja(caja.id, Number(saldoContadoInput));
      setModalCerrar(false);
      setSaldoContadoInput("");
      alert(resultado.mensaje);
      cargarCaja();
      setHistorial(await obtenerHistorialCajas());
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al cerrar la caja");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="p-6 bg-carbon-900 min-h-screen text-white space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-brand-400">Control de Caja y Reportes</h1>
          <p className="text-carbon-300 text-sm">Apertura, cierre y arqueo de caja por jornada.</p>
        </div>
        <select
          value={jornadaId ?? ""}
          onChange={(e) => setJornadaId(Number(e.target.value))}
          className="px-3 py-2 bg-carbon-800 border border-carbon-700 rounded text-white text-sm"
        >
          {jornadas.map((j) => (
            <option key={j.id} value={j.id}>{etiquetaJornada(j)}</option>
          ))}
        </select>
      </header>

      {cargando ? (
        <p className="text-carbon-400 text-sm">Cargando...</p>
      ) : !caja ? (
        <div className="bg-carbon-800 border border-dashed border-carbon-600 rounded-card p-10 text-center">
          <p className="text-carbon-300 mb-4">Aún no se ha abierto una caja para esta jornada.</p>
          <button onClick={() => setModalAbrir(true)} className="px-6 py-2.5 bg-brand-500 text-carbon-900 font-bold rounded-full">
            Abrir Caja
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BloqueResumen label="Saldo Inicial" valor={caja.saldoInicial} color="text-white" />
            <BloqueResumen label="Ingresos" valor={caja.ingresos} color="text-green-400" prefijo="+" />
            <BloqueResumen label="Salidas" valor={caja.salidas} color="text-red-400" prefijo="-" />
            <BloqueResumen label="Saldo Final" valor={caja.saldoFinalContado ?? caja.saldoFinalTeorico} color="text-brand-400" />
          </div>

          <p className="text-xs text-carbon-400">
            {caja.cantidadPedidos} pedido(s) pagados · {caja.cantidadGastos} gasto(s) registrados
            {caja.estado === 'abierta' && ` · caja abierta desde ${new Date(caja.fechaApertura).toLocaleString("es-CL")}`}
          </p>

          {caja.estado === 'abierta' ? (
            <button onClick={() => setModalCerrar(true)} className="px-6 py-2.5 bg-estado-agotado text-white font-bold rounded-full">
              Cerrar Caja
            </button>
          ) : (
            <div className={`p-4 rounded-card border ${caja.diferencia === 0 ? "border-green-500/40 bg-green-500/10" : "border-estado-agotado/40 bg-estado-agotado/10"}`}>
              <p className="font-bold">
                {caja.diferencia === 0
                  ? "✓ El efectivo contado cuadra exactamente con lo calculado."
                  : `⚠ Diferencia de ${formatoMoneda(Math.abs(caja.diferencia))} (${caja.diferencia > 0 ? "sobrante" : "faltante"}) respecto al efectivo contado.`}
              </p>
              <p className="text-xs text-carbon-300 mt-1">
                Saldo teórico: {formatoMoneda(caja.saldoFinalTeorico)} · Efectivo contado: {formatoMoneda(caja.saldoFinalContado)}
              </p>
            </div>
          )}
        </>
      )}

      <Modal open={modalAbrir} onClose={() => setModalAbrir(false)} title="Abrir Caja">
        <form onSubmit={handleAbrirCaja} className="space-y-4">
          <div>
            <label className="text-sm text-carbon-300 mb-1 block">Efectivo con el que abres la caja ($)</label>
            <input
              type="number" min="0" required autoFocus
              value={saldoInicialInput}
              onChange={(e) => setSaldoInicialInput(e.target.value)}
              className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded text-white"
            />
          </div>
          <button type="submit" disabled={procesando} className="w-full py-2.5 bg-brand-500 text-carbon-900 font-bold rounded disabled:opacity-40">
            {procesando ? "Abriendo..." : "Confirmar Apertura"}
          </button>
        </form>
      </Modal>

      <Modal open={modalCerrar} onClose={() => setModalCerrar(false)} title="Cerrar Caja">
        <form onSubmit={handleCerrarCaja} className="space-y-4">
          <p className="text-sm text-carbon-300">
            Saldo teórico actual: <span className="font-bold text-white">{formatoMoneda(caja?.saldoFinalTeorico)}</span>
          </p>
          <div>
            <label className="text-sm text-carbon-300 mb-1 block">Efectivo real contado ($)</label>
            <input
              type="number" min="0" required autoFocus
              value={saldoContadoInput}
              onChange={(e) => setSaldoContadoInput(e.target.value)}
              className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded text-white"
            />
          </div>
          <button type="submit" disabled={procesando} className="w-full py-2.5 bg-estado-agotado text-white font-bold rounded disabled:opacity-40">
            {procesando ? "Cerrando..." : "Confirmar Cierre"}
          </button>
        </form>
      </Modal>

      <section>
        <h2 className="text-lg font-semibold text-carbon-100 mb-3">Historial de cajas</h2>
        {historial.length === 0 ? (
          <p className="text-carbon-500 text-sm italic">Aún no hay cajas cerradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-carbon-400 text-left border-b border-carbon-700">
                  <th className="py-2 pr-4">Jornada</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Saldo Inicial</th>
                  <th className="py-2 pr-4">Saldo Final</th>
                  <th className="py-2 pr-4">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((c) => (
                  <tr key={c.id} className="border-b border-carbon-800">
                    <td className="py-2 pr-4">{new Date(c.fechaApertura).toLocaleDateString("es-CL")}</td>
                    <td className="py-2 pr-4 capitalize">{c.estado}</td>
                    <td className="py-2 pr-4">{formatoMoneda(c.saldoInicial)}</td>
                    <td className="py-2 pr-4">{c.saldoFinalContado != null ? formatoMoneda(c.saldoFinalContado) : "—"}</td>
                    <td className={`py-2 pr-4 ${c.diferencia === 0 ? "text-green-400" : c.diferencia > 0 ? "text-brand-400" : "text-estado-agotado"}`}>
                      {c.diferencia != null ? formatoMoneda(c.diferencia) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function BloqueResumen({ label, valor, color, prefijo = "" }) {
  return (
    <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4">
      <p className="text-xs text-carbon-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{prefijo}{`$${Number(valor || 0).toLocaleString("es-CL")}`}</p>
    </div>
  );
}