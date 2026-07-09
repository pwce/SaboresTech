import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import PinLoginView from "../views/common/PinLoginView.jsx";

export default function AppRoutes() {
  // se guarda solo el string del rol para evitar re-renders por objetos
  const [rolUsuario, setRolUsuario] = useState(null);

  const manejarLoginExitoso = (data) => {
    // el backend responde con { rol: 'atendedor' } o { rol: 'duena' } directamente
    console.log("Login exitoso capturado en AppRoutes:", data);
    if (data && data.rol) {
      setRolUsuario(data.rol);
    } else {
      setRolUsuario("atendedor");
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* pantalla pública de Login: Si ya tiene rol, salta directo a su panel */}
        <Route 
          path="/" 
          element={
            rolUsuario ? (
              <Navigate to={`/${rolUsuario}`} replace />
            ) : (
              <PinLoginView onLoginSuccess={manejarLoginExitoso} />
            )
          } 
        />

        {/* ruta para el Atendedor */}
        <Route 
          path="/atendedor" 
          element={
            // se quita temporalmente el guard problemático para probar la vista con estilos
            <div className="p-8 text-white bg-carbon-900 min-h-screen font-body">
              <h1 className="text-3xl font-display font-bold text-brand-500">
                Panel de Atendedor
              </h1>
              <p className="text-carbon-300 mt-2">¡Lograste entrar al sistema de comandas con éxito, Paz! 🎉</p>
            </div>
          } 
        />

        {/* ruta para la Dueña */}
        <Route 
          path="/duena" 
          element={
            <div className="p-8 text-white bg-carbon-900 min-h-screen font-body">
              <h1 className="text-3xl font-display font-bold text-accent">
                Panel de Dueña
              </h1>
              <p className="text-carbon-300 mt-2">¡Bienvenida al panel administrativo!</p>
            </div>
          } 
        />

        {/* redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}