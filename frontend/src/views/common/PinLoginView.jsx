import React, { useState, useEffect } from 'react';
import { verificarPin } from "../../api/auth.service.js";
import PinPad from "../../components/common/PinPad.jsx";

export default function PinLoginView({ onLoginSuccess }) {
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

  // Auto-envío al completar los 4 dígitos
  useEffect(() => {
    if (pin.length === 4) {
      procesarLogin();
    }
  }, [pin]);

  return (
    <div className="min-h-screen bg-carbon-900 flex flex-col justify-center items-center p-4 select-none">
      <div className="bg-carbon-800 p-8 rounded-card shadow-card border border-carbon-700 w-full max-w-md animate-popIn">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-brand-500 tracking-wide">
            Sabores de Carolina
          </h1>
          <p className="text-carbon-300 text-sm mt-1 font-body">Control de Acceso de Personal</p>
        </div>

        {/* Mensaje de Error / Estado */}
        <div className="h-6 text-center mb-4 font-body">
          {error && <p className="text-estado-agotado text-sm font-semibold">{error}</p>}
          {cargando && <p className="text-brand-300 text-sm animate-pulse">Verificando...</p>}
        </div>

        {/* Teclado Reutilizable */}
        <PinPad 
          pinLength={pin.length} 
          onPressNumber={manejarNumero} 
          onClear={limpiarTodo} 
          onDelete={borrarUltimo} 
        />

      </div>
    </div>
  );
}