// JornadaView.jsx
import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import InsumosForm from "./InsumosForm";
import ProductoSelector from "./ProductoSelector";
import { insumosVacios } from "./jornada.config";
import { obtenerJornadaActiva, abrirJornada, cerrarJornada, actualizarInsumosJornada } from "../../api/jornada.service";
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto, cambiarEstadoJornadaProducto, actualizarStockProducto } from "../../api/productos.service";

const GRUPOS_LABEL = {
  envases: "Envases",
  leches: "Leche",
  frutas: "Frutas",
  endulzantes: "Endulzantes",
  crema: "Crema",
  extras: "Otros insumos",
};

function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";
  const f = new Date(fechaIso);
  return f.toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" });
}

export default function JornadaView() {
  const [cargando, setCargando] = useState(true);
  const [jornada, setJornada] = useState(null); 
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");

  // estado del formulario de creación
  const [creandoJornada, setCreandoJornada] = useState(false);
  const [insumosForm, setInsumosForm] = useState(insumosVacios());
  const [seleccion, setSeleccion] = useState({}); 
  const [guardando, setGuardando] = useState(false);
  const [resumen, setResumen] = useState(null); 
  const [finalizando, setFinalizando] = useState(false);

  const cargarTodo = async () => {
    setCargando(true);
    setError("");
    try {
      const [jornadaActiva, catalogo] = await Promise.all([
        obtenerJornadaActiva(),
        obtenerProductos(),
      ]);
      setJornada(jornadaActiva);
      setProductos(catalogo || []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de la jornada. Verifica tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const toggleProducto = (id) => {
  const producto = productos.find((p) => p.id === id);
  setSeleccion((prev) => ({
    ...prev,
    [id]: {
      activo: !prev[id]?.activo,
      stock: producto?.controlaStock ? (prev[id]?.stock ?? 10) : null,
    },
  }));
};

  const cambiarStockSeleccion = (id, valor) => {
    setSeleccion((prev) => ({
      ...prev,
      [id]: { ...prev[id], stock: Math.max(0, Number(valor) || 0) },
    }));
  };

  const handleCrearProductoCatalogo = async (datos) => {
  const creado = await crearProducto(datos);
  setProductos((prev) => [...prev, { ...creado, categoria: datos.categoria }]);
};

const handleActualizarProductoCatalogo = async (id, cambios) => {
  const actualizado = await actualizarProducto(id, cambios);
  setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...actualizado } : p)));
};

const handleEliminarProductoCatalogo = async (id) => {
  await eliminarProducto(id);
  setProductos((prev) => prev.filter((p) => p.id !== id));
  setSeleccion((prev) => {
    const { [id]: _omitido, ...resto } = prev;
    return resto;
  });
};

  const handleConfirmarJornada = async () => {
  setGuardando(true);
  setError("");
  try {
    const productosSeleccionados = Object.entries(seleccion)
  .filter(([, v]) => v.activo)
  .map(([id, v]) => ({
    id: Number(id),
    stock: v.stock ?? null,
  }));

const respuesta = await abrirJornada(insumosForm, productosSeleccionados);
const nuevaJornada = respuesta.data;

const productosActivados = productos.filter((p) => seleccion[p.id]?.activo);

setResumen({
  fechaInicio: nuevaJornada.fechaInicio,
  insumos: insumosForm,
  productos: productosActivados.map((p) => ({
    ...p,
    stock: p.controlaStock ? (seleccion[p.id]?.stock ?? 0) : null,
  })),
});

    setCreandoJornada(false);
    setInsumosForm(insumosVacios());
    setSeleccion({});
    await cargarTodo();
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.mensaje || "No se pudo crear la jornada. Intenta nuevamente.");
  } finally {
    setGuardando(false);
  }
};

  const handleFinalizarJornada = async () => {
    if (!window.confirm("¿Seguro que quieres finalizar la jornada actual?")) return;
    setFinalizando(true);
    try {
      await cerrarJornada();
      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError("No se pudo finalizar la jornada.");
    } finally {
      setFinalizando(false);
    }
  };

  const marcarAgotado = async (grupo, key) => {
      if (!jornada) return;
      const insumosActualizados = structuredClone(jornada.insumos);
      const agotados = new Set(insumosActualizados.agotados || []);
      const llave = `${grupo}.${key}`;
      if (agotados.has(llave)) {
        agotados.delete(llave);
      } else {
        agotados.add(llave);
      }
      insumosActualizados.agotados = Array.from(agotados);
      try {
        await actualizarInsumosJornada(insumosActualizados);
        setJornada((prev) => ({ ...prev, insumos: insumosActualizados }));
      } catch (err) {
        console.error(err);
        setError("No se pudo actualizar el insumo.");
      }
    };
  
    if (cargando) {
      return <p className="text-carbon-300 animate-pulse">Cargando jornada...</p>;
    }
  
    return (
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-display font-bold text-brand-400">Jornada</h2>
          {!jornada && !creandoJornada && (
            <button
              onClick={() => setCreandoJornada(true)}
              className="px-5 py-3 rounded-card bg-brand-500 text-carbon-900 font-display font-bold text-sm hover:bg-brand-400 transition-colors min-h-touch"
            >
              + Crear nueva jornada
            </button>
          )}
          {jornada && (
            <button
              onClick={handleFinalizarJornada}
              disabled={finalizando}
              className="px-5 py-3 rounded-card border-2 border-estado-agotado text-estado-agotado font-display font-bold text-sm hover:bg-estado-agotado/10 transition-colors min-h-touch disabled:opacity-60"
            >
              {finalizando ? "Finalizando..." : "Finalizar jornada"}
            </button>
          )}
        </div>
  
        {error && (
          <div className="mb-6 px-4 py-3 rounded-card bg-estado-agotado/10 border border-estado-agotado text-estado-agotado text-sm">
            {error}
          </div>
        )}
  
        {/*estado: no hay jornada y no se está creando*/}
        {!jornada && !creandoJornada && (
          <div className="bg-carbon-800 border border-dashed border-carbon-600 rounded-card p-10 text-center">
            <p className="text-carbon-300">
              No hay ninguna jornada en curso. Presiona <span className="text-brand-400 font-semibold">"Crear nueva jornada"</span> para comenzar a vender hoy.
            </p>
          </div>
        )}
  
        {/*formulario de creación*/}
        {!jornada && creandoJornada && (
          <div className="space-y-8">
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-5">
              <h3 className="font-display font-bold text-white mb-4">1. Insumos disponibles hoy</h3>
              <InsumosForm insumos={insumosForm} onChange={setInsumosForm} />
            </div>
  
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-5">
              <h3 className="font-display font-bold text-white mb-4">2. Productos que se venderán hoy</h3>
              <ProductoSelector
                productos={productos}
                insumos={insumosForm}
                seleccion={seleccion}
                onToggle={toggleProducto}
                onCambiarStock={cambiarStockSeleccion}
                onCrearProducto={handleCrearProductoCatalogo}
                onActualizarProducto={handleActualizarProductoCatalogo}
                onEliminarProducto={handleEliminarProductoCatalogo}
              />
            </div>
  
            <div className="flex gap-3">
              <button
                onClick={handleConfirmarJornada}
                disabled={guardando}
                className="px-6 py-3 rounded-card bg-brand-500 text-carbon-900 font-display font-bold hover:bg-brand-400 transition-colors min-h-touch disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Aceptar y confirmar jornada"}
              </button>
              <button
                onClick={() => setCreandoJornada(false)}
                disabled={guardando}
                className="px-6 py-3 rounded-card border border-carbon-600 text-carbon-200 font-semibold min-h-touch"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
  
        {/* ---------- jornada activa: panel de administración ---------- */}
        {jornada && (
          <div className="space-y-6">
            <div className="bg-carbon-800 border border-brand-500/40 rounded-card p-5">
              <p className="text-sm text-carbon-300">Jornada iniciada</p>
              <p className="font-display font-bold text-xl text-brand-400">
                {formatearFecha(jornada.fechaInicio)}
              </p>
            </div>
  
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-5">
              <h3 className="font-display font-bold text-white mb-4">
                Insumos de la jornada{" "}
                <span className="text-carbon-400 text-sm font-normal">
                  (toca uno para marcarlo agotado)
                </span>
              </h3>
              {Object.entries(GRUPOS_LABEL).map(([grupo, label]) => {
                const valores = jornada.insumos?.[grupo];
                if (!valores || typeof valores !== "object") return null;
                return (
                  <div key={grupo} className="mb-4">
                    <h4 className="text-brand-300 font-semibold text-sm mb-2">{label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(valores).map(([key, val]) => {
                        const agotado = (jornada.insumos.agotados || []).includes(`${grupo}.${key}`);
                        const activo = grupo === "envases" ? Number(val) > 0 : Boolean(val);
                        if (!activo && !agotado) return null; // solo mostramos lo que se seleccionó
                        return (
                          <button
                            key={key}
                            onClick={() => marcarAgotado(grupo, key)}
                            className={`px-3 py-1.5 rounded-card text-xs font-semibold border transition-colors
                              ${
                                agotado
                                  ? "bg-estado-agotado/20 border-estado-agotado text-estado-agotado line-through"
                                  : "bg-carbon-900 border-carbon-600 text-carbon-100"
                              }`}
                          >
                            {key} {grupo === "envases" ? `(${val})` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
  
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-5">
              <h3 className="font-display font-bold text-white mb-4">Productos activos hoy</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {productos
                  .filter((p) => p.enJornada)
                  .map((p) => (
                    <ProductoActivoRow
                      key={p.id}
                      producto={p}
                      onCambiarStock={async (stock) => {
                        await actualizarStockProducto(p.id, stock);
                        setProductos((prev) =>
                          prev.map((x) => (x.id === p.id ? { ...x, stock } : x))
                        );
                      }}
                    />
                  ))}
                {productos.filter((p) => p.enJornada).length === 0 && (
                  <p className="text-carbon-400 text-sm">Ningún producto activo todavía.</p>
                )}
              </div>
            </div>
          </div>
        )}
  
        {/* ---------- popup de éxito ---------- */}
        <Modal open={!!resumen} onClose={() => setResumen(null)} title="Jornada creada exitosamente">
          {resumen && (
            <div className="space-y-4 text-sm">
              <p className="text-carbon-200">
                Inició el <span className="font-semibold text-white">{formatearFecha(resumen.fechaInicio)}</span>
              </p>
  
              <div>
                <p className="text-brand-300 font-semibold mb-1">Productos activos ({resumen.productos.length})</p>
                <ul className="space-y-1">
                  {resumen.productos.map((p) => (
                    <li key={p.id} className="flex justify-between text-carbon-100">
                      <span>{p.nombre}</span>
                      <span className="text-carbon-400">
                        {p.stock !== undefined && p.stock !== null ? `Stock: ${p.stock}` : "Sin stock fijo"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
  
              <button
                onClick={() => setResumen(null)}
                className="mt-2 w-full py-2.5 rounded-card bg-brand-500 text-carbon-900 font-display font-bold"
              >
                Listo
              </button>
            </div>
          )}
        </Modal>
      </div>
    );
  }
  
  function ProductoActivoRow({ producto, onCambiarStock }) {
  const [stockLocal, setStockLocal] = useState(producto.stock ?? 0);

  const handleStockChange = (e) => {
    const nuevoStock = Math.max(0, Number(e.target.value) || 0);
    setStockLocal(nuevoStock);
    onCambiarStock(nuevoStock);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-carbon-900 border border-carbon-700 rounded-card">
      <div>
        <p className="text-sm font-semibold text-white">{producto.nombre}</p>
        <p className="text-xs text-brand-400">${producto.precio?.toLocaleString("es-CL")}</p>
      </div>

      {producto.controlaStock ? (
        <div className="flex items-center gap-2">
          <label className="text-xs text-carbon-400">Stock:</label>
          <input
            type="number"
            value={stockLocal}
            onChange={handleStockChange}
            className="w-16 px-2 py-1 text-center bg-carbon-800 border border-carbon-600 rounded text-sm text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      ) : (
        <span className="text-xs text-carbon-500 italic">Ilimitado</span>
      )}
    </div>
  );
}