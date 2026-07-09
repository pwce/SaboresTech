import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import PinLoginView from "../views/common/PinLoginView.jsx";
import ProductosAdminView from "../views/common/ProductosAdminView.jsx";

export default function AppRoutes() {
  // se guarda solo el string del rol para evitar re-renders por objetos
  const [rolUsuario, setRolUsuario] = useState(null);

  const manejarLoginExitoso = (data) => {
    console.log("Login exitoso capturado en AppRoutes:", data);
    // secontrola de forma segura la asignación de la ruta según el backend
    if (data && (data.rol === "atendedor" || data.rol === "duena" || data.rol === "dueña")) {
      //'dueña' a 'duena' por consistencia con las rutas URL
      setRolUsuario(data.rol === "dueña" ? "duena" : data.rol);
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
            <div className="p-8 text-white bg-carbon-900 min-h-screen font-body">
              <h1 className="text-3xl font-display font-bold text-brand-500 mb-2">
                Panel de Atendedor
              </h1>
              <p className="text-carbon-300 mb-6">¡Lograste entrar al sistema de comandas con éxito, Paz! 🎉</p>
              
              {/* gestor de productos directamente en su panel */}
              <hr className="border-carbon-700 my-6" />
              <ProductosAdminView />
            </div>
          } 
        />

        {/* ruta para la Dueña */}
        <Route 
          path="/duena" 
          element={
            <div className="p-8 text-white bg-carbon-900 min-h-screen font-body">
              <h1 className="text-3xl font-display font-bold text-accent mb-2">
                Panel de Dueña
              </h1>
              <p className="text-carbon-300 mb-6">¡Bienvenida al panel administrativo, Jefa!</p>
              
              {/* la dueña también ve e interactúa con el mismo módulo exacto */}
              <hr className="border-carbon-700 my-6" />
              <ProductosAdminView />
            </div>
          } 
        />

        {/* redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}