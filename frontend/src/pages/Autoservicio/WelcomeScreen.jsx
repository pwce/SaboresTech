import { useAutoservicio, PASOS } from "../../context/AutoservicioContext";

export default function WelcomeScreen() {
  const { setPaso } = useAutoservicio();

  return (
    <button
      onClick={() => setPaso(PASOS.TIPO_SERVICIO)}
      className="w-full h-full min-h-screen bg-carbon-900 flex flex-col items-center justify-center gap-8 px-6 text-center focus:outline-none"
    >
      <span className="text-brand-400 font-display text-sm tracking-[0.3em] uppercase">
        Sabores de Carolina
      </span>

      <h1 className="font-display text-white text-5xl md:text-6xl font-bold leading-tight max-w-xl">
        Ordena y Paga Aquí
      </h1>

      <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center animate-pulse mt-4">
        <span className="text-accent text-2xl">👆</span>
      </div>

      <p className="text-carbon-300 text-lg animate-pulse">
        Presiona para ordenar
      </p>
    </button>
  );
}
