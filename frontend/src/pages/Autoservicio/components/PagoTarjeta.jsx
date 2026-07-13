import { useEffect, useState } from "react";
import { useAutoservicio, PASOS } from "../../../context/AutoservicioContext";

const ESTADOS = {
  ESPERANDO: "esperando",
  PROCESANDO: "procesando",
  APROBADO: "aprobado",
};

export default function PagoTarjeta() {
  const { total, setPedidoConfirmado, reiniciarPedido } = useAutoservicio();
  const [estado, setEstado] = useState(ESTADOS.ESPERANDO);

  useEffect(() => {
    const t1 = setTimeout(() => setEstado(ESTADOS.PROCESANDO), 2000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (estado !== ESTADOS.PROCESANDO) return;
    const t2 = setTimeout(() => {
      setEstado(ESTADOS.APROBADO);
      setPedidoConfirmado(true);
    }, 2000);
    return () => clearTimeout(t2);
  }, [estado, setPedidoConfirmado]);

  useEffect(() => {
    if (estado !== ESTADOS.APROBADO) return;
    
    const t3 = setTimeout(() => {
      reiniciarPedido();
    }, 3000); 
    return () => clearTimeout(t3);
  }, [estado, reiniciarPedido]);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center px-6 cursor-pointer"
      onClick={estado === ESTADOS.APROBADO ? reiniciarPedido : undefined}
    >
      <div 
        className="bg-carbon-800 border border-accent/30 rounded-card p-10 max-w-sm w-full text-center flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {estado === ESTADOS.ESPERANDO && (
          <>
            <span className="text-6xl">💳</span>
            <p className="text-white font-display text-lg font-medium">
              Pase la tarjeta por la máquina POS
            </p>
          </>
        )}

        {estado === ESTADOS.PROCESANDO && (
          <>
            <div className="w-14 h-14 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
            <p className="text-white font-display text-lg font-medium">
              Procesando tarjeta...
            </p>
          </>
        )}

        {estado === ESTADOS.APROBADO && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <span className="text-green-500 text-3xl">✓</span>
            </div>
            <p className="text-green-400 font-display text-xl font-bold">Aprobado</p>
            <p className="text-carbon-300 text-sm">Transacción completada con éxito.</p>
            <p className="text-accent text-xs animate-pulse mt-2">Redirigiendo al inicio...</p>
          </>
        )}
      </div>
    </div>
  );
}