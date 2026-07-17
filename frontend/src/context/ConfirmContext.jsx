// ConfirmContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [estado, setEstado] = useState(null); 
  const confirmar = useCallback(({ titulo = "Confirmar acción", mensaje, confirmarTexto = "Confirmar", cancelarTexto = "Cancelar", peligroso = false }) => {
    return new Promise((resolve) => {
      setEstado({ titulo, mensaje, confirmarTexto, cancelarTexto, peligroso, resolve });
    });
  }, []);

  function cerrar(resultado) {
    estado?.resolve(resultado);
    setEstado(null);
  }

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}

      {estado && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => cerrar(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-carbon-800 border border-accent/30 rounded-card w-full max-w-sm p-6 flex flex-col gap-4"
          >
            <h3 className="text-white font-display text-lg font-bold">{estado.titulo}</h3>
            <p className="text-carbon-200 text-sm">{estado.mensaje}</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => cerrar(false)}
                className="flex-1 py-2.5 rounded-card border border-carbon-600 text-carbon-200 font-semibold text-sm"
              >
                {estado.cancelarTexto}
              </button>
              <button
                onClick={() => cerrar(true)}
                className={`flex-1 py-2.5 rounded-card font-bold text-sm transition-transform active:scale-95 ${
                  estado.peligroso
                    ? "bg-estado-agotado text-white"
                    : "bg-brand-500 text-carbon-900"
                }`}
              >
                {estado.confirmarTexto}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  return ctx;
}