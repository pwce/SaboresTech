// GestionGastos.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { obtenerJornadas, obtenerGastos, crearGasto, marcarReembolsoHecho } from "../../api/gastos.service";

const CATEGORIAS = [
  { value: "compra_insumos", label: "Compra de insumos" },
  { value: "bencina", label: "Bencina" },
  { value: "permiso_municipal", label: "Pago permiso municipal" },
  { value: "impuestos", label: "Pago de impuestos" },
  { value: "sueldos", label: "Sueldos" },
  { value: "otros", label: "Otros" },
];

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "terceros", label: "Dinero de terceros" },
];

function etiquetaJornada(j) {
  const inicio = new Date(j.fechaInicio).toLocaleDateString("es-CL");
  return j.activa ? `Jornada actual (desde ${inicio})` : `Jornada del ${inicio}`;
}

const FORM_INICIAL = {
  nombreOperacion: "",
  categoria: "compra_insumos",
  metodoPago: "efectivo",
  monto: "",
  comprobante: null,
};

export default function GestionGastos() {
  const { rol } = useAuth();
  const esDuena = rol === "dueña";

  const [jornadas, setJornadas] = useState([]);
  const [jornadaId, setJornadaId] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  useEffect(() => {
    (async () => {
      const lista = await obtenerJornadas();
      setJornadas(lista);
      const activa = lista.find((j) => j.activa);
      setJornadaId(activa ? activa.id : lista[0]?.id ?? null);
    })();
  }, []);

  const cargarGastos = async () => {
    if (!jornadaId) return;
    setCargando(true);
    try {
      setGastos(await obtenerGastos({ jornadaId }));
    } catch (error) {
      console.error("Error al cargar gastos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarGastos(); }, [jornadaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jornadaId) return alert("Selecciona a qué jornada pertenece este gasto.");
    setEnviando(true);
    try {
      await crearGasto({ ...form, jornadaId });
      setForm(FORM_INICIAL);
      cargarGastos();
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al registrar el gasto");
    } finally {
      setEnviando(false);
    }
  };

  const handleReembolso = async (gastoId) => {
    if (!window.confirm("¿Confirmas que este reembolso ya fue pagado?")) return;
    try {
      await marcarReembolsoHecho(gastoId);
      cargarGastos();
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al marcar el reembolso");
    }
  };

  const reembolsosPendientes = gastos.filter((g) => g.metodoPago === "terceros" && g.estadoReembolso === "pendiente");
  const reembolsosHechos = gastos.filter((g) => g.metodoPago === "terceros" && g.estadoReembolso === "reembolsado");
  const gastosNormales = gastos.filter((g) => g.metodoPago !== "terceros");

  return (
    <div className="p-6 bg-carbon-900 min-h-screen text-white space-y-8">
      <header>
        <h1 className="text-2xl font-bold font-display text-brand-400">Gastos y Reembolsos</h1>
        <p className="text-carbon-300 text-sm">Registra los gastos operativos del local, de cualquier jornada.</p>
      </header>

      {/* selector de jornada */}
      <div className="max-w-md">
        <label className="text-sm text-carbon-300 mb-1 block">Jornada a la que pertenece</label>
        <select
          value={jornadaId ?? ""}
          onChange={(e) => setJornadaId(Number(e.target.value))}
          className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded text-white"
        >
          {jornadas.map((j) => (
            <option key={j.id} value={j.id}>{etiquetaJornada(j)}</option>
          ))}
        </select>
      </div>

      {/* formulario de nuevo gasto */}
      <form onSubmit={handleSubmit} className="bg-carbon-800 border border-carbon-700 rounded-card p-5 grid md:grid-cols-2 gap-4 max-w-3xl">
        <div>
          <label className="text-sm text-carbon-300 mb-1 block">Nombre de la operación</label>
          <input
            type="text"
            required
            value={form.nombreOperacion}
            onChange={(e) => setForm({ ...form, nombreOperacion: e.target.value })}
            className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded text-white"
            placeholder="Ej: Compra de vasos y servilletas"
          />
        </div>

        <div>
          <label className="text-sm text-carbon-300 mb-1 block">Categoría</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded text-white"
          >
            {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-carbon-300 mb-1 block">Pagado con</label>
          <select
            value={form.metodoPago}
            onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
            className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded text-white"
          >
            {METODOS_PAGO.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {form.metodoPago === "terceros" && (
            <p className="text-xs text-accent mt-1">Este gasto aparecerá como pendiente de reembolso.</p>
          )}
        </div>

        <div>
          <label className="text-sm text-carbon-300 mb-1 block">Monto ($)</label>
          <input
            type="number"
            min="1"
            required
            value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-carbon-300 mb-1 block">Comprobante (PDF o imagen, opcional)</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setForm({ ...form, comprobante: e.target.files[0] })}
            className="w-full text-sm text-carbon-300"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="md:col-span-2 py-2.5 bg-brand-500 text-carbon-900 font-bold rounded disabled:opacity-40"
        >
          {enviando ? "Guardando..." : "Registrar Gasto"}
        </button>
      </form>

      {/* listado de gastos de la jornada seleccionada */}
      <section>
        <h2 className="text-lg font-semibold text-carbon-100 mb-3">Gastos registrados en esta jornada</h2>
        {cargando ? (
          <p className="text-carbon-400 text-sm">Cargando...</p>
        ) : gastosNormales.length === 0 ? (
          <p className="text-carbon-500 text-sm italic">Aún no hay gastos registrados en esta jornada.</p>
        ) : (
          <div className="grid gap-3 max-w-3xl">
            {gastosNormales.map((g) => <TarjetaGasto key={g.id} gasto={g} />)}
          </div>
        )}
      </section>

      {/* reembolsos pendientes */}
      <section>
        <h2 className="text-lg font-semibold text-orange-400 mb-3">
          Reembolsos pendientes ({reembolsosPendientes.length})
        </h2>
        {reembolsosPendientes.length === 0 ? (
          <p className="text-carbon-500 text-sm italic">No hay reembolsos pendientes en esta jornada.</p>
        ) : (
          <div className="grid gap-3 max-w-3xl">
            {reembolsosPendientes.map((g) => (
              <TarjetaGasto key={g.id} gasto={g} accion={
                esDuena && (
                  <button
                    onClick={() => handleReembolso(g.id)}
                    className="px-4 py-1.5 bg-green-500 text-carbon-900 font-bold rounded text-sm hover:bg-green-400"
                  >
                    Marcar reembolso hecho
                  </button>
                )
              } />
            ))}
          </div>
        )}
      </section>

      {/* historial de reembolsos ya hechos */}
      {reembolsosHechos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-green-400 mb-3">Reembolsos ya realizados</h2>
          <div className="grid gap-3 max-w-3xl">
            {reembolsosHechos.map((g) => <TarjetaGasto key={g.id} gasto={g} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function TarjetaGasto({ gasto, accion }) {
  const categoriaLabel = CATEGORIAS.find((c) => c.value === gasto.categoria)?.label || gasto.categoria;
  const metodoLabel = METODOS_PAGO.find((m) => m.value === gasto.metodoPago)?.label || gasto.metodoPago;

  return (
    <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <p className="text-white font-semibold">{gasto.nombreOperacion}</p>
        <p className="text-xs text-carbon-400">{categoriaLabel} · {metodoLabel}</p>
        {gasto.comprobanteUrl && (
          <a href={gasto.comprobanteUrl} target="_blank" rel="noreferrer" className="text-xs text-accent underline">
            Ver comprobante
          </a>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-white">${gasto.monto.toLocaleString("es-CL")}</span>
        {accion}
      </div>
    </div>
  );
}