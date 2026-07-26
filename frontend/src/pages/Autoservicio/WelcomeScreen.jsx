import { useAutoservicio, PASOS } from "../../context/AutoservicioContext";
import logoCarolina from "../../assets/logocarolina.png";

export default function WelcomeScreen() {
  const { setPaso } = useAutoservicio();

  return (
    <button
      onClick={() => setPaso(PASOS.TIPO_SERVICIO)}
      className="w-full h-full min-h-screen bg-brand-500 flex flex-col items-center justify-center gap-8 px-6 text-center focus:outline-none"
    >
      <span className="text-white/80 font-display text-sm tracking-[0.3em] uppercase">
        Sabores de Carolina
      </span>

      <h1 className="font-display text-white text-5xl md:text-6xl font-bold leading-tight max-w-xl">
        Ordena y Paga Aquí
      </h1>

      <img
        src={logoCarolina}
        alt="Sabores de Carolina"
        className="w-96 h-96 md:w-80 md:h-80 object-contain animate-pulse mt-2"
      />

      <p className="text-white/90 text-lg animate-pulse">
        Presiona para ordenar
      </p>
    </button>
  );
}
