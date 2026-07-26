import { useState } from "react";
import { useAutoservicio, PASOS } from "../../context/AutoservicioContext";
import PagoEfectivo from "./components/PagoEfectivo";
import PagoTransferencia from "./components/PagoTransferencia";
import PagoTarjeta from "./components/PagoTarjeta";
import { IconEfectivo, IconTarjeta, IconTransferencia } from "../../components/Icons";

const METODOS = [
  { id: "efectivo", label: "Efectivo", Icono: IconEfectivo },
  { id: "tarjeta", label: "Tarjeta", Icono: IconTarjeta },
  { id: "transferencia", label: "Transferencia", Icono: IconTransferencia },
];

export default function PagoScreen() {
  const { total, setPaso } = useAutoservicio();
  const [metodo, setMetodo] = useState(null);

  return (
    <div className="min-h-screen bg-carbon-900 flex flex-col">
      <header className="p-6 border-b border-accent/20 flex items-center gap-4">
        <button
          onClick={() => (metodo ? setMetodo(null) : setPaso(PASOS.CARRITO))}
          className="text-carbon-300 text-2xl"
          aria-label="Volver"
        >
          ←
        </button>
        <div>
          <h1 className="text-white font-display text-2xl font-semibold">
            Métodos de pago
          </h1>
          {!metodo && (
            <p className="text-carbon-300 text-sm">
              Selecciona el método con el que deseas pagar
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 p-6">
        {!metodo && (
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {METODOS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetodo(m.id)}
                className="
                  aspect-square rounded-card bg-carbon-800 border-2 border-accent/30
                  flex flex-col items-center justify-center gap-3
                  hover:border-accent transition-colors active:scale-95
                "
              >
                <m.Icono className="w-10 h-10 text-brand-400" />
                <span className="text-white font-display font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        )}

        {!metodo && (
          <p className="text-center text-white font-display text-lg mt-8">
            Total: ${total.toLocaleString("es-CL")}
          </p>
        )}

        {metodo === "efectivo" && <PagoEfectivo onVolverAMetodos={() => setMetodo(null)} />}
        {metodo === "transferencia" && <PagoTransferencia onVolverAMetodos={() => setMetodo(null)} />}
        {metodo === "tarjeta" && <PagoTarjeta onVolverAMetodos={() => setMetodo(null)} />}
      </div>
    </div>
  );
}