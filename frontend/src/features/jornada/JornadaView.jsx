// JornadaView.jsx
import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { IconEditar, IconEliminar } from "../../components/Icons";
import InsumosForm from "./InsumosForm";
import ProductoSelector from "./ProductoSelector";
import { insumosVacios, obtenerLabelInsumo, CATEGORIAS_PRODUCTO } from "./jornada.config";
import { evaluarDisponibilidadProducto } from "./reglasDisponibilidad";
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

  // copia editable (aún no guardada) de los insumos de la jornada vigente,
  // para poder previsualizar el efecto de marcar algo agotado antes de confirmar
  const [insumosPendientes, setInsumosPendientes] = useState(null);
  const [guardandoInsumos, setGuardandoInsumos] = useState(false);
  
  // edicion o eliminación de un producto ya activo en la jornada vigente
  const [productoEditando, setProductoEditando] = useState(null);
  const [eliminandoActivoId, setEliminandoActivoId] = useState(null);

  const cargarTodo = async () => {
      setCargando(true);
      setError("");
      try {
        const [jornadaActiva, catalogo] = await Promise.all([
          obtenerJornadaActiva(),
          obtenerProductos(),
        ]);
        setJornada(jornadaActiva);
        setInsumosPendientes(jornadaActiva ? structuredClone(jornadaActiva.insumos) : null);
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
  
    // marca/desmarca un insumo como agotado SOLO localmente (aún no se guarda en el backend)
    const toggleAgotadoPendiente = (grupo, key) => {
      setInsumosPendientes((prev) => {
        const copia = structuredClone(prev);
        const agotados = new Set(copia.agotados || []);
        const llave = `${grupo}.${key}`;
        if (agotados.has(llave)) {
          agotados.delete(llave);
        } else {
          agotados.add(llave);
        }
        copia.agotados = Array.from(agotados);
        return copia;
      });
    };
  
    const huboCambiosEnInsumos =
      jornada && insumosPendientes
        ? JSON.stringify(jornada.insumos?.agotados || []) !== JSON.stringify(insumosPendientes.agotados || [])
        : false;
  
    // productos activos hoy que quedarían bloqueados si se guardan los cambios pendientes
    const productosActivos = productos.filter((p) => p.enJornada);
    const productosQueSeBloquearian = insumosPendientes
      ? productosActivos.filter((p) => evaluarDisponibilidadProducto(p.nombre, insumosPendientes).bloqueado)
      : [];
  
    const handleGuardarCambiosJornada = async () => {
      setGuardandoInsumos(true);
      setError("");
      try {
        await actualizarInsumosJornada(insumosPendientes);
  
        // apaga automáticamente los productos activos que ya no se pueden preparar
        // con los insumos disponibles/agotados actualizados
        await Promise.all(
          productosQueSeBloquearian.map((p) => cambiarEstadoJornadaProducto(p.id, false))
        );
  
        await cargarTodo();
      } catch (err) {
        console.error(err);
        setError("No se pudieron guardar los cambios de la jornada.");
      } finally {
        setGuardandoInsumos(false);
      }
    };
  
    const handleEliminarProductoActivo = async (producto) => {
      if (!window.confirm(`¿Eliminar "${producto.nombre}" del catálogo? Esta acción no se puede deshacer.`)) return;
      setEliminandoActivoId(producto.id);
      try {
        await handleEliminarProductoCatalogo(producto.id);
      } catch (err) {
        console.error(err);
        setError("No se pudo eliminar el producto.");
      } finally {
        setEliminandoActivoId(null);
      }
    };
  
    if (cargando) {
      return <p className="text-carbon-300 animate-pulse">Cargando jornada...</p>;
    }
  
    return (
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-400">Jornada</h2>
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
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4 sm:p-5">
              <h3 className="font-display font-bold text-white mb-4">1. Insumos disponibles hoy</h3>
              <InsumosForm insumos={insumosForm} onChange={setInsumosForm} />
            </div>
  
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4 sm:p-5">
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
  
            <div className="flex gap-3 flex-wrap">
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
  
        {/*jornada activa: panel de administración*/}
        {jornada && insumosPendientes && (
          <div className="space-y-6">
            <div className="bg-carbon-800 border border-brand-500/40 rounded-card p-4 sm:p-5">
              <p className="text-sm text-carbon-300">Jornada iniciada</p>
              <p className="font-display font-bold text-lg sm:text-xl text-brand-400">
                {formatearFecha(jornada.fechaInicio)}
              </p>
            </div>
  
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4 sm:p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 className="font-display font-bold text-white">
                  Insumos de la jornada{" "}
                  <span className="text-carbon-400 text-sm font-normal block sm:inline">
                    (toca uno para marcarlo agotado)
                  </span>
                </h3>
                {huboCambiosEnInsumos && (
                  <button
                    onClick={handleGuardarCambiosJornada}
                    disabled={guardandoInsumos}
                    className="px-4 py-2.5 rounded-card bg-brand-500 text-carbon-900 font-display font-bold text-sm hover:bg-brand-400 transition-colors min-h-touch disabled:opacity-60"
                  >
                    {guardandoInsumos ? "Guardando..." : "Guardar cambios en la jornada"}
                  </button>
                )}
              </div>
  
              {Object.entries(GRUPOS_LABEL).map(([grupo, label]) => {
                const valores = insumosPendientes?.[grupo];
                if (!valores || typeof valores !== "object") return null;
                return (
                  <div key={grupo} className="mb-4">
                    <h4 className="text-brand-300 font-semibold text-sm mb-2">{label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(valores).map(([key, val]) => {
                        const agotado = (insumosPendientes.agotados || []).includes(`${grupo}.${key}`);
                        const activo = grupo === "envases" ? Number(val) > 0 : Boolean(val);
                        if (!activo && !agotado) return null; // solo mostramos lo que se seleccionó
                        return (
                          <button
                            key={key}
                            onClick={() => toggleAgotadoPendiente(grupo, key)}
                            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors min-h-touch
                              ${
                                agotado
                                  ? "bg-estado-agotado/20 border-estado-agotado text-estado-agotado line-through"
                                  : "bg-carbon-900 border-carbon-600 text-carbon-100"
                              }`}
                          >
                            {obtenerLabelInsumo(grupo, key)} {grupo === "envases" ? `(${val})` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
  
              {huboCambiosEnInsumos && productosQueSeBloquearian.length > 0 && (
                <div className="mt-4 px-4 py-3 rounded-card bg-estado-agotado/10 border border-estado-agotado text-sm text-estado-agotado">
                  <p className="font-semibold mb-1">
                    Al guardar, estos productos activos se desactivarán automáticamente porque ya no se pueden preparar:
                  </p>
                  <ul className="list-disc list-inside">
                    {productosQueSeBloquearian.map((p) => (
                      <li key={p.id}>{p.nombre}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
  
            <div className="bg-carbon-800 border border-carbon-700 rounded-card p-4 sm:p-5">
              <h3 className="font-display font-bold text-white mb-4">Productos activos hoy</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {productosActivos.map((p) => {
                  const { bloqueado, razon } = evaluarDisponibilidadProducto(p.nombre, insumosPendientes);
                  return (
                    <ProductoActivoRow
                      key={p.id}
                      producto={p}
                      bloqueado={bloqueado}
                      razonBloqueo={razon}
                      eliminando={eliminandoActivoId === p.id}
                      onCambiarStock={async (stock) => {
                        await actualizarStockProducto(p.id, stock);
                        setProductos((prev) =>
                          prev.map((x) => (x.id === p.id ? { ...x, stock } : x))
                        );
                      }}
                      onEditar={() => setProductoEditando(p)}
                      onEliminar={() => handleEliminarProductoActivo(p)}
                    />
                  );
                })}
                {productosActivos.length === 0 && (
                  <p className="text-carbon-400 text-sm">Ningún producto activo todavía.</p>
                )}
              </div>
            </div>
          </div>
        )}
  
        {/*popup de éxito*/}
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
  
        {/*editar un producto ya activo en la jornada vigente*/}
        <Modal open={!!productoEditando} onClose={() => setProductoEditando(null)} title="Editar producto">
          {productoEditando && (
            <EditarProductoForm
              producto={productoEditando}
              onGuardar={async (cambios) => {
                await handleActualizarProductoCatalogo(productoEditando.id, cambios);
                setProductoEditando(null);
              }}
              onCancelar={() => setProductoEditando(null)}
            />
          )}
        </Modal>
      </div>
    );
  }
  
  function ProductoActivoRow({ producto, bloqueado, razonBloqueo, eliminando, onCambiarStock, onEditar, onEliminar }) {
    const [stockLocal, setStockLocal] = useState(producto.stock ?? 0);
  
    const handleStockChange = (e) => {
      const nuevoStock = Math.max(0, Number(e.target.value) || 0);
      setStockLocal(nuevoStock);
      onCambiarStock(nuevoStock);
    };
  
    return (
      <div
        className={`flex items-center justify-between gap-2 p-3 bg-carbon-900 border rounded-card
          ${bloqueado ? "border-estado-agotado/60" : "border-carbon-700"}`}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{producto.nombre}</p>
          <p className="text-xs text-brand-400">${producto.precio?.toLocaleString("es-CL")}</p>
          {bloqueado && (
            <p className="text-xs text-estado-agotado mt-0.5">Se desactivará: {razonBloqueo}</p>
          )}
        </div>
  
        <div className="flex items-center gap-2 shrink-0">
          {producto.controlaStock ? (
            <div className="flex items-center gap-1">
              <label className="text-xs text-carbon-400 hidden sm:inline">Stock:</label>
              <input
                type="number"
                value={stockLocal}
                onChange={handleStockChange}
                className="w-14 px-2 py-1 text-center bg-carbon-800 border border-carbon-600 rounded text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          ) : (
            <span className="text-xs text-carbon-500 italic hidden sm:inline">Ilimitado</span>
          )}
  
          <button
            type="button"
            title="Editar producto"
            onClick={onEditar}
            className="w-8 h-8 flex items-center justify-center rounded-card border border-carbon-600 text-carbon-300 hover:text-brand-400 hover:border-brand-400"
          >
            <IconEditar className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Eliminar producto"
            disabled={eliminando}
            onClick={onEliminar}
            className="w-8 h-8 flex items-center justify-center rounded-card border border-carbon-600 text-carbon-300 hover:text-estado-agotado hover:border-estado-agotado disabled:opacity-50"
          >
            {eliminando ? "…" : <IconEliminar className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }
  
  function EditarProductoForm({ producto, onGuardar, onCancelar }) {
    const [nombre, setNombre] = useState(producto.nombre);
    const [precio, setPrecio] = useState(producto.precio);
    const [categoria, setCategoria] = useState(producto.categoria);
    const [controlaStock, setControlaStock] = useState(!!producto.controlaStock);
    const [imagenFile, setImagenFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [guardando, setGuardando] = useState(false);
  
    const handleImagenChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImagenFile(file);
        setPreview(URL.createObjectURL(file));
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!nombre || !precio) return;
      setGuardando(true);
      try {
        await onGuardar({ nombre, precio, categoria, controlaStock, imagen: imagenFile });
      } finally {
        setGuardando(false);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
            required
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
          >
            {CATEGORIAS_PRODUCTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-carbon-200">
            <input
              type="checkbox"
              checked={controlaStock}
              onChange={(e) => setControlaStock(e.target.checked)}
              className="w-5 h-5 accent-brand-500"
            />
            Tiene stock fijo
          </label>
  
          <div className="sm:col-span-2 flex items-center gap-4 bg-carbon-900/50 p-3 rounded-card border border-carbon-700">
            <div className="flex-1">
              <label className="block text-xs text-carbon-300 mb-1">Reemplazar imagen (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="block w-full text-xs text-carbon-400
                  file:mr-4 file:py-1.5 file:px-3
                  file:rounded-card file:border-0
                  file:text-xs file:font-semibold
                  file:bg-brand-500/10 file:text-brand-400
                  hover:file:bg-brand-500/20 cursor-pointer"
              />
            </div>
            <img
              src={preview || producto.imagen}
              alt="Vista previa"
              className="w-16 h-16 object-cover rounded-card border border-carbon-600 bg-carbon-900"
            />
          </div>
        </div>
  
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="px-4 py-2 rounded-card bg-brand-500 text-carbon-900 font-semibold text-sm disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-card border border-carbon-600 text-carbon-200 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }