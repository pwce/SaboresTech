// ProductosAdminView.jsx
import React, { useState, useEffect } from 'react';
import { useToast } from "../../context/ToastContext";

export default function ProductosAdminView() {
  const mostrarToast = useToast();

  // estado para los productos
  const [productos, setProductos] = useState([]);

  // estado para el formulario de nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    categoria: 'empanadas',
    controlaStock: true,
    imagen: null
  });

  // sstado para el inventario de insumos del día (frappes y jugos)
  const [insumosHoy, setInsumosHoy] = useState({
    frutas: { frutilla: true, mango: true, piña: false, platano: true, naranja: false, arándano: true, frambuesa: true },
    leches: { entera: true, deslactosada: true },
    endulzante: { azucar: true, endulzante: true },
    extras: { crema: true, galletas_oreo: true, chocolatepolvo: true, matcha: true, café: true, vainilla: true, menta: true  },
    envases: {vasos: 200, tapas: 200, bombillas: 200}
  });
  
  useEffect(() => {
    const cargarProductosBD = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/productos');
        if (response.ok) {
          const datos = await response.json();

          setProductos(datos.map(p => ({ ...p, activoHoy: false, stockActual: 0 })));
        } else {
          console.error("Error al obtener productos del servidor");
        }
      } catch (error) {
        console.error("Error conectando con el catálogo maestro de la BD:", error);
      }
    };
    cargarProductosBD();
  }, []);

  // funciones para actualizar productos
  const toggleActivoHoy = (id) => {
    setProductos(prev => prev.map(p => 
      p.id === id ? { ...p, activoHoy: !p.activoHoy, stockActual: !p.activoHoy ? 10 : 0 } : p
    ));
  };

  const ajustarStock = (id, incremento) => {
    setProductos(prev => prev.map(p => 
      p.id === id ? { ...p, stockActual: Math.max(0, p.stockActual + incremento) } : p
    ));
  };

  const ajustarEnvase = (tipo, incremento) => {
    setInsumosHoy(prev => ({
      ...prev,
      envases: { ...prev.envases, [tipo]: Math.max(0, prev.envases[tipo] + incremento) }
    }));
  };

  const cambiarPrecioTemporal = (id, nuevoPrecio) => {
    setProductos(prev => prev.map(p => 
      p.id === id ? { ...p, precio: Number(nuevoPrecio) } : p
    ));
  };

  // agregar nuevo producto al catalogo real
  const handleCrearProducto = async (e) => {
  e.preventDefault();
  if (!nuevoProducto.nombre || !nuevoProducto.precio) return;

  try {

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sIjoiZHVlw7FhIiwibm9tYnJlIjoiQ2Fyb2xpbmEiLCJpYXQiOjE3ODM2NzQ4MDcsImV4cCI6MTc4MzcxODAwN30.tvP-U4GoyOc9clBH-8zbx4zrpPL9z6eoaNjahAbm2_E";

    const formData = new FormData();
    formData.append('nombre', nuevoProducto.nombre);
    formData.append('precio', String(nuevoProducto.precio));
    formData.append('categoria', nuevoProducto.categoria);
    formData.append('controlaStock', String(nuevoProducto.controlaStock));
    
    if (nuevoProducto.imagen) {
      formData.append('imagen', nuevoProducto.imagen);
    }

    const response = await fetch('http://localhost:3000/api/v1/productos', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${token}`},
      body: formData 
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    const productoGuardado = await response.json();

    const nuevoProductoConEstado = {
      ...productoGuardado,
      activoHoy: true,
      stockActual: productoGuardado.controlaStock ? 10 : 0
    };

    setProductos(prev => [...prev, nuevoProductoConEstado]);
    
    setNuevoProducto({
      nombre: '',
      precio: '',
      categoria: 'empanadas',
      controlaStock: true,
      imagen: null
    });
    
    e.target.reset();
    mostrarToast("Producto creado y guardado con éxito", "exito");

  } catch (error) {
    console.error("Error al conectar con la API:", error);
    mostrarToast("Hubo un problema al guardar el producto. Verifica la conexión.", "error");
  }
};

  // funcion para manejar los insumos (toggles rápidos)
  const toggleInsumo = (tipo, clave) => {
    setInsumosHoy(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], [clave]: !prev[tipo][clave] }
    }));
  };

  const guardarJornada = () => {
    const configuracionTotal = {
      productosActivos: productos.filter(p => p.activoHoy),
      insumosDisponibles: insumosHoy
    };
    console.log("ENVIANDO A BASE DE DATOS:", configuracionTotal);
    mostrarToast("¡Jornada de Sabores de Carolina configurada con éxito!", "exito");
  };

  const categorias = ['empanadas', 'pizzas', 'frappes', 'jugos', 'milkshakes', 'bebidas'];

  return (
    <div className="bg-carbon-900 text-white min-h-screen p-4 font-body">

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-brand-500">Configuración de la Jornada</h2>
          <p className="text-sm text-carbon-300">Define stock fijo, modifica precios del día y declara insumos para licuadora/cafetera.</p>
        </div>
        <button 
          onClick={guardarJornada}
          className="min-h-touch bg-accent hover:bg-accent-dark text-white font-display font-bold px-8 rounded-card transition-colors shadow-lg w-full md:w-auto"
        >
          Confirmar y Abrir Jornada
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA Y CENTRAL: PRODUCTOS POR CATEGORÍA */}
        <div className="lg:col-span-8 space-y-8">

          {/* FORMULARIO PARA CREAR NUEVO PRODUCTO EN EL SISTEMA */}
          <div className="bg-carbon-850 p-5 rounded-card border-2 border-dashed border-carbon-700 shadow-md">
            <h3 className="text-md font-display font-bold text-brand-400 mb-4 flex items-center gap-2">
              Agregar Nuevo Producto al Menú
            </h3>
            <form onSubmit={handleCrearProducto} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="text-[11px] text-carbon-400 uppercase font-bold block mb-1">Nombre</label>
                <input 
                  type="text" 
                  placeholder="Ej: Coca Cola en Lata" 
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                  className="w-full bg-carbon-900 border border-carbon-700 rounded p-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-carbon-400 uppercase font-bold block mb-1">Precio ($)</label>
                <input 
                  type="number" 
                  placeholder="1500" 
                  value={nuevoProducto.precio}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
                  className="w-full bg-carbon-900 border border-carbon-700 rounded p-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] text-carbon-400 uppercase font-bold block mb-1">Categoría</label>
                <select 
                  value={nuevoProducto.categoria}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                  className="w-full bg-carbon-900 border border-carbon-700 rounded p-2 text-sm text-white focus:outline-none focus:border-brand-500 capitalize"
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center justify-between gap-2 bg-carbon-900 border border-carbon-700 rounded p-2 h-[38px]">
                <span className="text-xs text-carbon-300 font-medium">¿Lleva Stock Fijo?</span>
                <input 
                  type="checkbox"
                  checked={nuevoProducto.controlaStock}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, controlaStock: e.target.checked})}
                  className="w-4 h-4 accent-brand-500 cursor-pointer"
                />
              </div>

              <div className="sm:col-span-9">
                <label className="text-[11px] text-carbon-400 uppercase font-bold block mb-1">Foto del Producto</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setNuevoProducto({...nuevoProducto, imagen: e.target.files[0]})}
                  className="w-full bg-carbon-900 border border-carbon-700 rounded p-1.5 text-xs text-brand-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-carbon-950 hover:file:bg-brand-600 file:cursor-pointer"
                />
              </div>

              <div className="sm:col-span-3">
                <button 
                  type="submit" 
                  className="w-full bg-brand-500 hover:bg-brand-600 text-carbon-950 font-bold text-xs py-2.5 rounded transition-all uppercase tracking-wider shadow"
                >
                  Guardar Item
                </button>
              </div>
            </form>
          </div>

          {categorias.map(cat => (
            <div key={cat} className="bg-carbon-850 p-5 rounded-card border border-carbon-700 shadow-card">
              <h3 className="text-lg font-display font-bold uppercase tracking-widest text-brand-400 mb-5 border-b border-carbon-700 pb-2 flex items-center gap-2">
                {cat === 'empanadas' && 'Empanadas'}
                {cat === 'pizzas' && 'Pizzas'}
                {cat === 'frappes' && 'Frappés'}
                {cat === 'jugos' && 'Jugos Naturales'}
                {cat === 'milkshakes' && 'Milkshakes'}
                {cat === 'bebidas' && 'Bebidas'}
              </h3>

              <div className="space-y-4">
                {productos.filter(p => p.categoria === cat).map(p => (
                  <div key={p.id} className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${p.activoHoy ? 'bg-carbon-800 border-brand-500 shadow-md' : 'bg-carbon-900 border-carbon-800 opacity-40'}`}>
                    <div className="flex items-center gap-4">
                      <img src={p.imagen} alt={p.nombre} className="w-14 h-14 bg-carbon-700 rounded-lg object-cover shadow-inner" />
                      <div>
                        <h4 className="font-bold text-brand-100">{p.nombre}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-carbon-400">$</span>
                          <input 
                            type="number" 
                            value={p.precio} 
                            onChange={(e) => cambiarPrecioTemporal(p.id, e.target.value)}
                            className="bg-carbon-900 border border-carbon-700 text-xs rounded px-1 py-0.5 w-16 text-brand-400 font-bold focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <button onClick={() => toggleActivoHoy(p.id)} className={`w-12 h-6 rounded-full p-1 transition-colors ${p.activoHoy ? 'bg-brand-500' : 'bg-carbon-600'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full transition-transform ${p.activoHoy ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>

                      {p.activoHoy && p.controlaStock && (
                        <div className="flex items-center bg-carbon-900 border border-carbon-700 rounded-lg overflow-hidden p-0.5 gap-1">
                          <button type="button" onClick={() => ajustarStock(p.id, -5)} className="px-2 py-1 text-xs font-bold text-accent/70 hover:bg-carbon-800 rounded">-5</button>
                          <button type="button" onClick={() => ajustarStock(p.id, -1)} className="px-2.5 py-1 text-base font-bold text-accent hover:bg-carbon-800 rounded">-</button>
                          <span className="w-10 text-center font-display font-bold text-sm text-brand-100">{p.stockActual}</span>
                          <button type="button" onClick={() => ajustarStock(p.id, 1)} className="px-2.5 py-1 text-base font-bold text-brand-500 hover:bg-carbon-800 rounded">+</button>
                          <button type="button" onClick={() => ajustarStock(p.id, 5)} className="px-2 py-1 text-xs font-bold text-brand-500/70 hover:bg-carbon-800 rounded">+5</button>
                        </div>
                      )}

                      {p.activoHoy && !p.controlaStock && (
                        <span className="text-xs text-brand-400 font-semibold bg-brand-950/40 px-3 py-1.5 rounded border border-brand-900">Al momento</span>
                      )}
                    </div>
                  </div>
                ))}
                {productos.filter(p => p.categoria === cat).length === 0 && (
                  <p className="text-xs text-carbon-500 italic text-center py-2">No hay productos agregados en esta categoría todavía.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: PACKAGING E INSUMOS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Módulo Envases */}
          <div className="bg-carbon-800 p-5 rounded-card border-2 border-accent shadow-card">
            <h3 className="text-lg font-display font-bold text-accent mb-4 flex items-center gap-2">Envases Críticos</h3>
            <div className="space-y-4">
              {Object.keys(insumosHoy.envases).map(item => (
                <div key={item} className="flex flex-col sm:flex-row justify-between sm:items-center bg-carbon-900 p-3 rounded-lg border border-carbon-700 gap-3">
                  <span className="capitalize font-semibold text-sm text-brand-100">{item}</span>
                  
                  <div className="flex items-center bg-carbon-850 border border-carbon-700 rounded-lg overflow-hidden p-0.5 gap-1 self-end sm:self-auto">                   
                    <button type="button" onClick={() => ajustarEnvase(item, -5)} className="px-2 py-1 text-xs font-bold text-accent/70 hover:bg-carbon-800 rounded">-5</button>
                    <button type="button" onClick={() => ajustarEnvase(item, -1)} className="px-2.5 py-1 text-base font-bold text-accent hover:bg-carbon-800 rounded">-</button>          
                    <span className="w-10 text-center font-display font-bold text-sm text-brand-400">{insumosHoy.envases[item]}</span>
                    <button type="button" onClick={() => ajustarEnvase(item, 1)} className="px-2.5 py-1 text-base font-bold text-brand-500 hover:bg-carbon-800 rounded">+</button>
                    <button type="button" onClick={() => ajustarEnvase(item, 5)} className="px-2 py-1 text-xs font-bold text-brand-500/70 hover:bg-carbon-800 rounded">+5</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Módulo Insumos / Frutas */}
          <div className="bg-carbon-800 p-5 rounded-card border-2 border-accent shadow-card">
            <div>
              <h4 className="text-xs font-bold text-carbon-400 uppercase tracking-widest mb-3">Frutas Disponibles</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(insumosHoy.frutas).map(f => (
                  <button key={f} type="button" onClick={() => toggleInsumo('frutas', f)} className={`p-2 rounded text-[10px] font-bold border capitalize transition-all ${insumosHoy.frutas[f] ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-carbon-900 border-carbon-800 text-carbon-600 line-through'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-xs font-bold text-carbon-400 uppercase tracking-widest mb-3">Leches</h4>
              {Object.keys(insumosHoy.leches).map(l => (
                <button key={l} type="button" onClick={() => toggleInsumo('leches', l)} className={`w-full mb-2 p-2 rounded text-[10px] font-bold border capitalize ${insumosHoy.leches[l] ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-carbon-900 border-carbon-800 text-carbon-600'}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold text-carbon-400 uppercase tracking-widest mb-3">Extras y Variantes</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(insumosHoy.extras).map(ex => (
                  <div key={ex} className="flex justify-between items-center p-2 bg-carbon-900 rounded border border-carbon-800">
                    <span className="text-[10px] capitalize font-medium">{ex.replace('_', ' ')}</span>
                    <button
                      type="button"
                      onClick={() => toggleInsumo('extras', ex)}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${insumosHoy.extras[ex] ? 'bg-brand-500 text-white' : 'bg-carbon-700 text-carbon-400'}`}
                    >
                      {insumosHoy.extras[ex] ? 'SÍ' : 'NO'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}