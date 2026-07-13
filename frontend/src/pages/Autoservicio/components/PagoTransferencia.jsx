import { useState } from "react";
import { useAutoservicio, PASOS } from "../../../context/AutoservicioContext";

const DATOS_BANCARIOS = {
  banco: "Mercado Pago",
  tipoCuenta: "Cuenta Vista",
  rut: "12.345.678-9",
  numeroCuenta: 1234567890,
  titular: "Sabores de Carolina",
  email: "saboresdecarolinaaa@gmail.com",
};

export default function PagoTransferencia() {
  const { total, setPaso, setPedidoConfirmado, reiniciarPedido } = useAutoservicio();
  const [verificado, setVerificado] = useState(false);

  function toggleVerificado() {
    const nuevo = !verificado;
    setVerificado(nuevo);
    if (nuevo) setPedidoConfirmado(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-carbon-800 border border-accent/20 rounded-card p-6">
        <h2 className="text-white font-display text-lg font-semibold mb-4">
          Datos para transferir
        </h2>
        <dl className="flex flex-col gap-2 text-sm">
          {Object.entries({
            Banco: DATOS_BANCARIOS.banco,
            "Tipo de cuenta": DATOS_BANCARIOS.tipoCuenta,
            Rut: DATOS_BANCARIOS.rut,
            "N° de cuenta": DATOS_BANCARIOS.numeroCuenta,
            Titular: DATOS_BANCARIOS.titular,
            Email: DATOS_BANCARIOS.email,
            Monto: `$${total.toLocaleString("es-CL")}`,
          }).map(([label, valor]) => (
            <div key={label} className="flex justify-between border-b border-carbon-700 py-1">
              <dt className="text-carbon-300">{label}</dt>
              <dd className="text-white font-medium">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/*switch que en produccion activa el atendedor tras revisar el comprobante*/}
      <div className="border-t border-dashed border-accent/30 pt-6 flex items-center justify-between">
        <div>
          <p className="text-accent text-xs uppercase tracking-wide mb-1">
            Simulación · Vista del atendedor
          </p>
          <p className="text-white">Comprobante verificado</p>
        </div>
        <button
          onClick={toggleVerificado}
          role="switch"
          aria-checked={verificado}
          className={`w-16 h-9 rounded-full relative transition-colors ${verificado ? "bg-brand-500" : "bg-carbon-700"}`}
        >
          <span
            className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-transform ${verificado ? "translate-x-8" : "translate-x-1"}`}
          />
        </button>
      </div>

      {verificado && (
        <div
          className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center"
          onClick={reiniciarPedido}
        >
          <div className="bg-carbon-800 border border-accent/30 rounded-card p-8 text-center flex flex-col items-center gap-3">
            <span className="text-6xl">✅</span>
            <h2 className="text-white font-display text-2xl font-bold">Pedido confirmado</h2>
            <p className="text-carbon-300 text-sm">Comprobante validado correctamente! Presiona para continuar</p>
          </div>
        </div>
      )}
    </div>
  );
}
