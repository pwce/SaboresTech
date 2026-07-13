import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { verificarPin } from "../../api/auth.service.js";
import PinPad from "./PinPad.jsx";

export default function PinLoginView({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarNumero = (num) => {
    if (pin.length < 4) {
      setError('');
      setPin((prev) => prev + num);
    }
  };

  const borrarUltimo = () => setPin((prev) => prev.slice(0, -1));
  const limpiarTodo = () => {
    setPin('');
    setError('');
  };

  const procesarLogin = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await verificarPin(pin);
      if (data.success) {
        sessionStorage.setItem('sabores_carolina_session', JSON.stringify({ token: data.token }));
        if (onLoginSuccess) onLoginSuccess(data);
      } else {
        setError(data.mensaje || 'PIN incorrecto');
        limpiarTodo();
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      limpiarTodo();
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      procesarLogin();
    }
  }, [pin]);

  return (
    <div className="min-h-screen bg-carbon-900 flex flex-col justify-center items-center p-4 select-none">
      <div className="bg-carbon-800 p-8 rounded-card shadow-card border border-carbon-700 w-full max-w-md animate-popIn">
        
        {/* encabezado */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-brand-500 tracking-wide">
            Sabores de Carolina
          </h1>
          <p className="text-carbon-300 text-sm mt-1 font-body">Control de Acceso de Personal</p>
        </div>

        {/* mensaje de error/estado */}
        <div className="h-6 text-center mb-4 font-body">
          {error && <p className="text-estado-agotado text-sm font-semibold">{error}</p>}
          {cargando && <p className="text-brand-300 text-sm animate-pulse">Verificando...</p>}
        </div>

        {/* reclado reutilizable */}
        <PinPad 
          pinLength={pin.length} 
          onPressNumber={manejarNumero} 
          onClear={limpiarTodo} 
          onDelete={borrarUltimo} 
        />

        {/*boton de autoservicio*/}
        <div className="w-full max-w-xs mx-auto mt-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex-1 h-px bg-carbon-700" />
            <span className="text-carbon-500 text-xs uppercase font-body">o</span>
            <span className="flex-1 h-px bg-carbon-700" />
          </div>
          <button
            type="button"
            onClick={() => navigate("/autoservicio")}
            className="w-full py-3 px-4 rounded-card border-2 border-accent text-brand-400 hover:bg-brand-500/10 transition-all font-display font-semibold text-sm uppercase tracking-wider shadow-md"
          >
            Acceder al Autoservicio 
          </button>
        </div>

      </div>
    </div>
  );
}