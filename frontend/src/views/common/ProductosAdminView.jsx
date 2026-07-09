import React, { useState } from 'react';

//catálogo maestro extendido (en el futuro vendrá de la base de datos con sus imágenes)
const CATALOGO_MAESTRO = [
  { id: 1, nombre: 'Empanada de Pino', precio: 3000, categoria: 'empanadas', controlaStock: true, imagen: 'https://via.placeholder.com/60' },
  { id: 2, nombre: 'Empanada Pollo-Choclo-Queso', precio: 3000, categoria: 'empanadas', controlaStock: true, imagen: 'https://via.placeholder.com/60' },
  { id: 3, nombre: 'Pizza Napolitana', precio: 3000, categoria: 'pizzas', controlaStock: true, imagen: 'https://via.placeholder.com/60' },
  { id: 4, nombre: 'Pizza Vegetariana', precio: 3000, categoria: 'pizzas', controlaStock: true, imagen: 'https://via.placeholder.com/60' },
  { id: 5, nombre: 'Frappé Base', precio: 3500, categoria: 'frappes', controlaStock: false, imagen: 'https://via.placeholder.com/60' },
  { id: 6, nombre: 'Jugo Natural (1 o 2 Frutas)', precio: 2500, categoria: 'jugos', controlaStock: false, imagen: 'https://via.placeholder.com/60' },
];

export default function ProductosAdminView() {
  // Estado para los productos
  const [productos, setProductos] = useState(
    CATALOGO_MAESTRO.map(p => ({ ...p, activoHoy: false, stockActual: 0 }))
  );

  // Estado para el inventario de insumos del día (Frappés y Jugos)
  const [insumosHoy, setInsumosHoy] = useState({
    frutas: { frutilla: true, mango: true, piña: false, platano: true, durazno: false },
    leches: { entera: true, deslactosada: true },
    extras: { crema: true }
  });

  // Funciones para actualizar productos
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

  const cambiarPrecioTemporal = (id, nuevoPrecio) => {
    setProductos(prev => prev.map(p => 
      p.id === id ? { ...p, precio: Number(nuevoPrecio) } : p
    ));
  };

  // Función para manejar los insumos (toggles rápidos)
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
    alert("¡Jornada de Sabores de Carolina configurada con éxito! 🚀");
  };

  // Agrupamos los productos por su categoría para renderizarlos ordenados
  const categorias = ['empanadas', 'pizzas', 'frappes', 'jugos'];

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
          Abrir Caja e Inventario de Hoy
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA Y CENTRAL: PRODUCTOS POR CATEGORÍA */}
        <div className="lg:col-span-2 space-y-8">
          {categorias.map(cat => (
            <div key={cat} className="bg-carbon-850 p-4 rounded-card border border-carbon-700">
              <h3 className="text-lg font-display font-bold uppercase tracking-wider text-brand-400 mb-4 border-b border-carbon-700 pb-2">
                {cat === 'empanadas' && '🥟 Empanadas'}
                {cat === 'pizzas' && '🍕 Pizzas'}
                {cat === 'frappes' && '🥤 Frappés & Milkshakes'}
                {cat === 'jugos' && '🍹 Jugos Naturales'}
              </h3>

              <div className="space-y-3">
                {productos.filter(p => p.categoria === cat).map(p => (
                  <div 
                    key={p.id} 
                    className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                      p.activoHoy ? 'bg-carbon-800 border-brand-500' : 'bg-carbon-900 border-carbon-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.imagen} alt={p.nombre} className="w-12 h-12 rounded-lg object-cover bg-carbon-700" />
                      <div>
                        <h4 className="font-bold text-sm sm:text-base">{p.nombre}</h4>
                        {/* INPUT TÁCTIL PARA CAMBIAR PRECIO RÁPIDO */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-carbon-400">$</span>
                          <input 
                            type="number" 
                            value={p.precio} 
                            onChange={(e) => cambiarPrecioTemporal(p.id, e.target.value)}
                            className="bg-carbon-900 border border-carbon-700 text-xs rounded px-1 py-0.5 w-16 text-brand-400 font-bold focus:outline-none focus:border-brand-500"
                          />
                          <span className="text-xs text-carbon-500">CLP</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Toggle Activo */}
                      <button
                        onClick={() => toggleActivoHoy(p.id)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${p.activoHoy ? 'bg-brand-500' : 'bg-carbon-600'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full transition-transform ${p.activoHoy ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>

                      {/* Control de Stock (Solo si aplica) */}
                      {p.activoHoy && p.controlaStock && (
                        <div className="flex items-center bg-carbon-900 border border-carbon-700 rounded p-0.5">
                          <button onClick={() => ajustarStock(p.id, -5)} className="px-1.5 py-1 text-xs font-bold text-accent">-5</button>
                          <button onClick={() => ajustarStock(p.id, -1)} className="px-2 py-1 font-bold text-accent">-</button>
                          <span className="w-8 text-center font-bold text-sm">{p.stockActual}</span>
                          <button onClick={() => ajustarStock(p.id, 1)} className="px-2 py-1 font-bold text-brand-500">+</button>
                          <button onClick={() => ajustarStock(p.id, 5)} className="px-1.5 py-1 text-xs font-bold text-brand-500">+5</button>
                        </div>
                      )}
                      
                      {p.activoHoy && !p.controlaStock && (
                        <span className="text-xs text-brand-400 font-semibold bg-brand-950/40 px-2 py-1 rounded border border-brand-900">Al momento</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: GESTIÓN DE INSUMOS CRÍTICOS (FRUTAS, LECHES, EXTRAS) */}
        <div className="space-y-6">
          <div className="bg-carbon-850 p-4 rounded-card border border-carbon-700 sticky top-4">
            <h3 className="text-lg font-display font-bold text-accent mb-4 border-b border-carbon-700 pb-2">🍓 Insumos para Barra</h3>
            
            {/* Sección Frutas */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-carbon-400 uppercase tracking-wider mb-2">Frutas de Hoy (Jugos/Frappés)</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(insumosHoy.frutas).map(fruta => (
                  <button
                    key={fruta}
                    onClick={() => toggleInsumo('frutas', fruta)}
                    className={`p-2 rounded text-xs font-semibold border capitalize transition-all ${
                      insumosHoy.frutas[fruta] ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-carbon-900 border-carbon-800 text-carbon-500 line-through'
                    }`}
                  >
                    {fruta}
                  </button>
                ))}
              </div>
            </div>

            {/* Sección Leches */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-carbon-400 uppercase tracking-wider mb-2">Tipos de Leche</h4>
              <div className="space-y-2">
                {Object.keys(insumosHoy.leches).map(leche => (
                  <div key={leche} className="flex justify-between items-center p-2 bg-carbon-900 rounded border border-carbon-800">
                    <span className="text-xs capitalize">Leche {leche}</span>
                    <button
                      onClick={() => toggleInsumo('leches', leche)}
                      className={`px-3 py-1 rounded text-xs font-bold ${insumosHoy.leches[leche] ? 'bg-brand-500 text-white' : 'bg-carbon-700 text-carbon-400'}`}
                    >
                      {insumosHoy.leches[leche] ? 'SÍ' : 'NO'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección Cremas/Toppings */}
            <div>
              <h4 className="text-xs font-bold text-carbon-400 uppercase tracking-wider mb-2">Toppings / Crema Chantilly</h4>
              <div className="flex justify-between items-center p-2 bg-carbon-900 rounded border border-carbon-800">
                <span className="text-xs">¿Hay Crema para Frappés?</span>
                <button
                  onClick={() => toggleInsumo('extras', 'crema')}
                  className={`px-3 py-1 rounded text-xs font-bold ${insumosHoy.extras.crema ? 'bg-brand-500 text-white' : 'bg-carbon-700 text-carbon-400'}`}
                >
                  {insumosHoy.extras.crema ? 'SÍ' : 'NO'}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}