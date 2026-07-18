import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // [{ id, tipo, mensaje }]

  const mostrarToast = useCallback((mensaje, tipo = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={mostrarToast}>
      {children}

      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-card px-4 py-3 shadow-lg border text-sm font-semibold animate-fade-in
              ${
                t.tipo === "error"
                  ? "bg-estado-agotado/15 border-estado-agotado text-estado-agotado"
                  : t.tipo === "exito"
                  ? "bg-brand-500/15 border-brand-500 text-brand-300"
                  : "bg-carbon-800 border-carbon-600 text-white"
              }`}
          >
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}