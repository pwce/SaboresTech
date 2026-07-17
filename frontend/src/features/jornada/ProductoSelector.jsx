// ProductoSelector.jsx
import React, { useState } from "react";
import { CATEGORIAS_PRODUCTO, esProductoDeStockFijoPorNombre } from "./jornada.config";
import { evaluarDisponibilidadProducto } from "./reglasDisponibilidad";
import { IconEditar, IconEliminar } from "../../components/Icons";
import { useConfirm } from "../../context/ConfirmContext";

export default function ProductoSelector({
  productos,
  insumos,
  seleccion,
  onToggle,
  onCambiarStock,
  onCrearProducto,
  onActualizarProducto,
  onEliminarProducto,
}) {
  const confirmar = useConfirm();
  const [formAbierto, setFormAbierto] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Salado", controlaStock: true });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [creando, setCreando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [edicion, setEdicion] = useState({ nombre: "", precio: "", categoria: "Salado", controlaStock: true });
  const [edicionImagenFile, setEdicionImagenFile] = useState(null);
  const [edicionPreview, setEdicionPreview] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const iniciarEdicion = (p) => {
    setEditandoId(p.id);
    setEdicion({
      nombre: p.nombre,
      precio: p.precio,
      categoria: p.categoria,
      controlaStock: !!p.controlaStock,
    });
    setEdicionImagenFile(null);
    setEdicionPreview("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEdicionImagenFile(null);
    setEdicionPreview("");
  };

  const handleEdicionImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEdicionImagenFile(file);
      setEdicionPreview(URL.createObjectURL(file));
    }
  };

  const handleGuardarEdicion = async (id) => {
    if (!edicion.nombre || !edicion.precio) return;
    setGuardandoEdicion(true);
    try {
      await onActualizarProducto(id, {
        nombre: edicion.nombre,
        precio: edicion.precio,
        categoria: edicion.categoria,
        controlaStock: edicion.controlaStock,
        imagen: edicionImagenFile,
      });
      cancelarEdicion();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleEliminar = async (p) => {
    const ok = await confirmar({
      titulo: "Eliminar producto",
      mensaje: `¿Eliminar "${p.nombre}" del catálogo? Esta acción no se puede deshacer.`,
      confirmarTexto: "Eliminar",
      peligroso: true,
    });
    if (!ok) return;

    setEliminandoId(p.id);
    try {
      await onEliminarProducto(p.id);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    } finally {
      setEliminandoId(null);
    }
  };

  const productosPorCategoria = CATEGORIAS_PRODUCTO.map((cat) => ({
    categoria: cat,
    items: productos.filter((p) => p.categoria === cat),
  }));

  const categoriasConocidas = CATEGORIAS_PRODUCTO.map((c) => c.toLowerCase());
  const otros = productos.filter((p) => !categoriasConocidas.includes((p.categoria || "").toLowerCase()));

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.precio) return;
    setCreando(true);

    try {
      await onCrearProducto({
        nombre: nuevo.nombre,
        precio: nuevo.precio,
        categoria: nuevo.categoria,
        controlaStock: nuevo.controlaStock,
        imagen: imagenFile,
      });

      setNuevo({ nombre: "", precio: "", categoria: "Salado", controlaStock: true });
      setImagenFile(null);
      setPreview("");
      setFormAbierto(false);
    } catch (error) {
      console.error("Error al crear el producto:", error);
    } finally {
      setCreando(false);
    }
  };

  const renderFormularioEdicion = (p) => (
    <form
      key={p.id}
      onSubmit={(e) => {
        e.preventDefault();
        handleGuardarEdicion(p.id);
      }}
      className="col-span-full bg-carbon-900 border border-brand-500 rounded-card p-4 space-y-3"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Nombre del producto"
          value={edicion.nombre}
          onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
          className="bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Precio"
          value={edicion.precio}
          onChange={(e) => setEdicion({ ...edicion, precio: e.target.value })}
          className="bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
          required
        />
        <select
          value={edicion.categoria}
          onChange={(e) => setEdicion({ ...edicion, categoria: e.target.value })}
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
            checked={edicion.controlaStock}
            onChange={(e) => setEdicion({ ...edicion, controlaStock: e.target.checked })}
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
              onChange={handleEdicionImagenChange}
              className="block w-full text-xs text-carbon-400
                file:mr-4 file:py-1.5 file:px-3
                file:rounded-card file:border-0
                file:text-xs file:font-semibold
                file:bg-brand-500/10 file:text-brand-400
                hover:file:bg-brand-500/20 cursor-pointer"
            />
          </div>
          <img
            src={edicionPreview || p.imagen || "https://via.placeholder.com/60"}
            alt={p.nombre}
            className="w-16 h-16 object-cover rounded-card border border-carbon-600 bg-carbon-900"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={guardandoEdicion}
          className="px-4 py-2 rounded-card bg-brand-500 text-carbon-900 font-semibold text-sm disabled:opacity-60"
        >
          {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={cancelarEdicion}
          className="px-4 py-2 rounded-card border border-carbon-600 text-carbon-200 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );

  const renderProducto = (p) => {
    if (editandoId === p.id) return renderFormularioEdicion(p);

    const { esSinStock, bloqueado, razon } = evaluarDisponibilidadProducto(p.nombre, insumos);
    const esStockFijo = !esSinStock && (p.controlaStock ?? esProductoDeStockFijoPorNombre(p.nombre));
    const sel = seleccion[p.id] || { activo: false, stock: 0 };
    const eliminando = eliminandoId === p.id;

    return (
      <div
        key={p.id}
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-card border transition-colors
          ${sel.activo ? "border-brand-500 bg-brand-500/10" : "border-carbon-700 bg-carbon-800"}
          ${bloqueado ? "opacity-50" : ""}`}
      >
        <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
          <input
            type="checkbox"
            disabled={bloqueado}
            checked={sel.activo}
            onChange={() => onToggle(p.id)}
            className="w-5 h-5 accent-brand-500"
          />
          {p.imagen && (
            <img
              src={p.imagen}
              alt={p.nombre}
              className="w-10 h-10 object-cover rounded bg-carbon-900 border border-carbon-700"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/60";
              }}
            />
          )}
          <span className="truncate">
            <span className="font-semibold text-white">{p.nombre}</span>
            <span className="text-carbon-300 text-sm ml-2">${p.precio}</span>
          </span>
        </label>

        {esStockFijo && sel.activo && (
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-carbon-300">Stock</label>
            <input
              type="number"
              min="0"
              value={sel.stock}
              onChange={(e) => onCambiarStock(p.id, e.target.value)}
              className="w-16 bg-carbon-900 border border-carbon-600 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        )}

        {bloqueado && (
          <span className="text-xs text-estado-agotado shrink-0 max-w-[9rem] text-right">{razon}</span>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Editar producto"
            onClick={() => iniciarEdicion(p)}
            className="w-8 h-8 flex items-center justify-center rounded-card border border-carbon-600 text-carbon-300 hover:text-brand-400 hover:border-brand-400"
          >
            <IconEditar className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Eliminar producto"
            disabled={eliminando}
            onClick={() => handleEliminar(p)}
            className="w-8 h-8 flex items-center justify-center rounded-card border border-carbon-600 text-carbon-300 hover:text-estado-agotado hover:border-estado-agotado disabled:opacity-50"
          >
            {eliminando ? "…" : <IconEliminar className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {productosPorCategoria.map(({ categoria, items }) => (
        <div key={categoria} className="mb-6">
          <h4 className="font-display font-semibold text-brand-300 mb-3">{categoria}</h4>
          {items.length === 0 ? (
            <p className="text-carbon-400 text-sm">No hay productos en esta categoría todavía.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">{items.map(renderProducto)}</div>
          )}
        </div>
      ))}

      {otros.length > 0 && (
        <div className="mb-6">
          <h4 className="font-display font-semibold text-brand-300 mb-3">Otros</h4>
          <div className="grid sm:grid-cols-2 gap-2">{otros.map(renderProducto)}</div>
        </div>
      )}

      <div className="mt-4 border-t border-carbon-700 pt-4">
        {!formAbierto ? (
          <button
            type="button"
            onClick={() => setFormAbierto(true)}
            className="text-brand-400 font-semibold text-sm hover:text-brand-300"
          >
            + Crear nuevo producto en el catálogo
          </button>
        ) : (
          <form onSubmit={handleCrear} className="bg-carbon-800 border border-carbon-700 rounded-card p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                className="bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Precio"
                value={nuevo.precio}
                onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                className="bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
                required
              />
              <select
                value={nuevo.categoria}
                onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
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
                  checked={nuevo.controlaStock}
                  onChange={(e) => setNuevo({ ...nuevo, controlaStock: e.target.checked })}
                  className="w-5 h-5 accent-brand-500"
                />
                Tiene stock fijo (ej: pizzas, empanadas, bebidas en lata)
              </label>

              <div className="sm:col-span-2 flex items-center gap-4 bg-carbon-900/50 p-3 rounded-card border border-carbon-700">
                <div className="flex-1">
                  <label className="block text-xs text-carbon-300 mb-1">Imagen del Producto</label>
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
                {preview && (
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="w-16 h-16 object-cover rounded-card border border-carbon-600 bg-carbon-900"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creando}
                className="px-4 py-2 rounded-card bg-brand-500 text-carbon-900 font-semibold text-sm disabled:opacity-60"
              >
                {creando ? "Guardando..." : "Guardar producto"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormAbierto(false);
                  setPreview("");
                  setImagenFile(null);
                }}
                className="px-4 py-2 rounded-card border border-carbon-600 text-carbon-200 text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}