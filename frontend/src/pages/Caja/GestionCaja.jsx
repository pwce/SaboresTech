import { useEffect, useState } from "react";
import { obtenerJornadas } from "../../api/gastos.service";
import { obtenerCajaPorJornada, abrirCaja, cerrarCaja, obtenerHistorialCajas } from "../../api/caja.service";
import { obtenerReporteJornada, obtenerResumenPeriodo } from "../../api/reportes.service";
import Modal from "../../components/Modal";
import SelectorJornadaPorFecha from "../../components/SelectorJornadaPorFecha";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORES_METODO = { efectivo: "#22c55e", transferencia: "#38bdf8", tarjeta: "#f59e0b" };
const COLORES_PRODUCTO = ["#22c55e", "#38bdf8", "#f59e0b", "#a855f7", "#ef4444", "#14b8a6", "#eab308", "#ec4899"];

function formatoMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
}

export default function GestionCaja() {
  const mostrarToast = useToast();
  const confirmar = useConfirm();
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

  const [reporteJornada, setReporteJornada] = useState(null);
  const [cargandoReporte, setCargandoReporte] = useState(true);

  const [tipoResumen, setTipoResumen] = useState("semanal");
  const [resumenPeriodo, setResumenPeriodo] = useState([]);
  const [cargandoResumen, setCargandoResumen] = useState(true);

  useEffect(() => {
    (async () => {
      const lista = await obtenerJornadas();
      setJornadas(lista);
      const activa = lista.find((j) => j.activa);
      setJornadaId(activa ? activa.id : lista[0]?.id ?? null);
      setHistorial(await obtenerHistorialCajas());
    })();
  }, []);


  const cargarCaja = async (mostrarCargando = true) => {
    if (!jornadaId) return;
    if (mostrarCargando) setCargando(true);
    try {
      setCaja(await obtenerCajaPorJornada(jornadaId));
    } catch (error) {
      console.error("Error al consultar la caja:", error);
    } finally {
      if (mostrarCargando) setCargando(false);
    }
  };

  useEffect(() => {
    cargarCaja(true);
    const interval = setInterval(() => cargarCaja(false), 5000);
    return () => clearInterval(interval);
  }, [jornadaId]);

  useEffect(() => {
    if (!jornadaId) return;
    setCargandoReporte(true);
    obtenerReporteJornada(jornadaId)
      .then(setReporteJornada)
      .catch((error) => console.error("Error al consultar el reporte de la jornada:", error))
      .finally(() => setCargandoReporte(false));
  }, [jornadaId]);

  useEffect(() => {
    setCargandoResumen(true);
    obtenerResumenPeriodo(tipoResumen)
      .then(setResumenPeriodo)
      .catch((error) => console.error("Error al consultar el resumen por periodo:", error))
      .finally(() => setCargandoResumen(false));
  }, [tipoResumen]);


  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const resultado = await abrirCaja(jornadaId, Number(saldoInicialInput));
      setModalAbrir(false);
      setSaldoInicialInput("");
      mostrarToast(resultado.mensaje, "exito");
      cargarCaja();
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || "Error al abrir la caja", "error");
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
      mostrarToast(resultado.mensaje, "exito");
      cargarCaja();
      setHistorial(await obtenerHistorialCajas());
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || "Error al cerrar la caja", "error");
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
        <SelectorJornadaPorFecha jornadas={jornadas} jornadaId={jornadaId} onChange={setJornadaId} />
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
            <BloqueResumen label="Saldo Inicial (sencillo)" valor={caja.saldoInicial} color="text-white" />
            <BloqueResumen label="Ingresos en efectivo" valor={caja.ingresos} color="text-green-400" prefijo="+" />
            <BloqueResumen label="Salidas en efectivo" valor={caja.salidas} color="text-red-400" prefijo="-" />
            <BloqueResumen label="Efectivo esperado en caja" valor={caja.saldoFinalContado ?? caja.saldoFinalTeorico} color="text-brand-400" />
          </div>

          <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4">
            <p className="text-xs text-carbon-400 uppercase tracking-wide mb-1">Ganancia real de la jornada</p>
            <p className={`text-2xl font-black ${caja.gananciaReal >= 0 ? "text-green-400" : "text-estado-agotado"}`}>
              {formatoMoneda(caja.gananciaReal)}
            </p>
            <p className="text-sm md:text-base text-white mt-2 leading-relaxed">
              Ventas totales {formatoMoneda(caja.ventasTotales)} (efectivo + transferencia + tarjeta) − gastos {formatoMoneda(caja.gastosTotales)}.
              No incluye el saldo inicial: eso es solo el sencillo con el que se abrió la caja, no es ganancia.
            </p>
            {caja.ventasPorMetodo && Object.keys(caja.ventasPorMetodo).length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {Object.entries(caja.ventasPorMetodo).map(([metodo, monto]) => {
                  const porcentaje = caja.ventasTotales > 0 ? Math.round((monto / caja.ventasTotales) * 100) : 0;
                  return (
                    <span key={metodo} className="text-xs px-3 py-1.5 rounded-full bg-carbon-900 border border-carbon-600 text-carbon-200 capitalize">
                      {metodo}: {formatoMoneda(monto)} ({porcentaje}%)
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-sm md:text-base text-white font-medium">
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
        <h2 className="text-lg font-semibold text-carbon-100 mb-3">Reportes de la jornada</h2>

        {cargandoReporte ? (
          <p className="text-carbon-400 text-sm">Cargando reporte...</p>
        ) : !reporteJornada || reporteJornada.cantidadPedidos === 0 ? (
          <p className="text-carbon-500 text-sm italic">Todavía no hay ventas validadas en esta jornada.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 items-start">
            <GraficoTorta
              titulo="Ventas por método de pago"
              datos={Object.entries(reporteJornada.ventasPorMetodo).map(([nombre, valor]) => ({
                nombre,
                valor,
              }))}
              obtenerColor={(nombre) => COLORES_METODO[nombre] || "#71717a"}
              alturaGrafico={260}
            />
            <div className="md:col-span-2">
              <GraficoTorta
                titulo="Ventas por producto"
                datos={reporteJornada.ventasPorProducto.map((p) => ({ nombre: p.nombre, valor: p.monto }))}
                obtenerColor={(_, i) => COLORES_PRODUCTO[i % COLORES_PRODUCTO.length]}
                alturaGrafico={360}
                mostrarEtiquetas={reporteJornada.ventasPorProducto.length <= 5}
              />
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-carbon-100">Resumen por periodo</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTipoResumen("semanal")}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                tipoResumen === "semanal" ? "bg-brand-500 border-brand-500 text-carbon-900" : "border-carbon-600 text-carbon-300"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setTipoResumen("mensual")}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                tipoResumen === "mensual" ? "bg-brand-500 border-brand-500 text-carbon-900" : "border-carbon-600 text-carbon-300"
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {cargandoResumen ? (
          <p className="text-carbon-400 text-sm">Cargando resumen...</p>
        ) : resumenPeriodo.length === 0 ? (
          <p className="text-carbon-500 text-sm italic">Aún no hay jornadas registradas para resumir.</p>
        ) : (
          <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumenPeriodo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="periodo" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                  formatter={(valor) => formatoMoneda(valor)}
                />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#22c55e" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="gananciaReal" name="Ganancia real" fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

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

function GraficoTorta({ titulo, datos, obtenerColor, alturaGrafico = 240, mostrarEtiquetas = true }) {
  const total = datos.reduce((acc, d) => acc + d.valor, 0);
  const radio = mostrarEtiquetas ? Math.min(alturaGrafico * 0.3, 100) : Math.min(alturaGrafico * 0.38, 140);
  return (
    <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4" style={{ height: alturaGrafico + 60 }}>
      <p className="text-sm font-semibold text-carbon-200 mb-2">{titulo}</p>
      <ResponsiveContainer width="100%" height={alturaGrafico}>
        <PieChart>
          <Pie
            data={datos}
            dataKey="valor"
            nameKey="nombre"
            cx="50%"
            cy="50%"
            outerRadius={radio}
            isAnimationActive={false}
            label={
              mostrarEtiquetas
                ? ({ nombre, valor }) => `${nombre} (${total > 0 ? Math.round((valor / total) * 100) : 0}%)`
                : false
            }
          >
            {datos.map((d, i) => (
              <Cell key={d.nombre} fill={obtenerColor(d.nombre, i)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            formatter={(valor, nombre) => [formatoMoneda(valor), nombre]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
