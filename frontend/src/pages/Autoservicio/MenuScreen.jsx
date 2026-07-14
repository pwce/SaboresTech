import { useState, useMemo, useEffect } from "react";
import { obtenerProductos } from "../../api/productos.service";
import CategoriaTabs from "./components/CategoriaTabs";
import ProductoCard from "./components/ProductoCard";
import ProductoModal from "./components/ProductoModal";
import CarritoFlotante from "./components/CarritoFlotante";
import { CATEGORIAS_PRODUCTO } from "../../features/jornada/jornada.config";


export default function MenuScreen() {

  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS_PRODUCTO[0]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const [productosReal, setProductosReal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarMenu() {
      try {
        setCargando(true);
        const data = await obtenerProductos(); 
        
        const activosHoy = data.filter(p => Boolean(p.enJornada));
        
        setProductosReal(activosHoy);
      } catch (err) {
        console.error("Error al cargar el menú del backend:", err);
        setError("No se pudo cargar el menú. Por favor, intente más tarde.");
      } finally {
        setCargando(false);
      }
    }
    cargarMenu();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productosReal.filter(
      (p) => (p.categoria || "").toLowerCase() === (categoriaActiva || "").toLowerCase()
    );
  }, [categoriaActiva, productosReal]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center text-white">
        <span className="animate-pulse">Cargando delicias de SaboresTech...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center text-rose-400 p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-900 pb-32">

      <CategoriaTabs
        categorias={CATEGORIAS_PRODUCTO.map(cat => ({
          id: cat,
          nombre: cat,
          label: cat,
          name: cat,
          text: cat
        }))}
        activa={categoriaActiva}
        onChange={setCategoriaActiva}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {productosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12 text-carbon-400 text-sm">
            No hay productos disponibles en esta categoría para el día de hoy.
          </div>
        ) : (
          productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onAgregar={setProductoSeleccionado}
            />
          ))
        )}
      </div>

      <CarritoFlotante />

      {productoSeleccionado && (
        <ProductoModal
          producto={productoSeleccionado}
          onCerrar={() => setProductoSeleccionado(null)}
        />
      )}
    </div>
  );
}