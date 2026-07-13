import { useState, useMemo } from "react";
import { CATEGORIAS, PRODUCTOS } from "./data/productos.mock";
import CategoriaTabs from "./components/CategoriaTabs";
import ProductoCard from "./components/ProductoCard";
import ProductoModal from "./components/ProductoModal";
import CarritoFlotante from "./components/CarritoFlotante";

export default function MenuScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS[0].id);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const productosFiltrados = useMemo(
    () => PRODUCTOS.filter((p) => p.categoria === categoriaActiva),
    [categoriaActiva]
  );

  return (
    <div className="min-h-screen bg-carbon-900 pb-32">
      <CategoriaTabs
        categorias={CATEGORIAS}
        activa={categoriaActiva}
        onChange={setCategoriaActiva}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {productosFiltrados.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            onAgregar={setProductoSeleccionado}
          />
        ))}
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
