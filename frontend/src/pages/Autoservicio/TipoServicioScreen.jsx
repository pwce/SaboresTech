import { useAutoservicio, PASOS } from "../../context/AutoservicioContext";
import { IconComerAqui, IconParaLlevar } from "../../components/Icons";

const OPCIONES = [
  { id: "aqui", label: "Para comer aquí", Icono: IconComerAqui },
  { id: "llevar", label: "Para llevar", Icono: IconParaLlevar },
];

export default function TipoServicioScreen() {
  const { setTipoServicio, setPaso } = useAutoservicio();

  function elegir(opcionId) {
    setTipoServicio(opcionId);
    setPaso(PASOS.MENU);
  }

  return (
    <div className="min-h-screen bg-carbon-900 flex flex-col items-center justify-center px-6 gap-10">
      <h1 className="font-display text-white text-3xl md:text-4xl font-semibold text-center">
        Selecciona dónde comerás hoy
      </h1>

      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
        {OPCIONES.map((op) => (
          <button
            key={op.id}
            onClick={() => elegir(op.id)}
            className="
              aspect-square rounded-card bg-carbon-800 border-2 border-accent/40
              flex flex-col items-center justify-center gap-4 p-6
              transition-all active:scale-95 hover:border-accent hover:shadow-pop
            "
          >
            <op.Icono className="w-16 h-16 text-accent" />
            <span className="text-white font-display text-xl font-medium text-center">
              {op.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
