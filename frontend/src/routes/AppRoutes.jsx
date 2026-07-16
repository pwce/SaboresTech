// AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import AutoservicioView from "../pages/Autoservicio/AutoservicioView";
import ProtectedRoute from "./ProtectedRoute";
import PinLoginView from "../pages/Auth/PinLoginView.jsx";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import JornadaView from "../features/jornada/JornadaView";
import GestionPagos from "../pages/Atendedor/GestionPagos"; 
import GestionPedidos from "../pages/Admin/GestionPedidos"; 
import GestionGastos from "../pages/Gastos/GestionGastos";
import GestionCaja from "../pages/Caja/GestionCaja";

function ModuloProximamente({ nombre }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-display font-bold text-brand-400 mb-4">{nombre}</h2>
      <div className="bg-carbon-800 border border-dashed border-carbon-600 rounded-card p-10 text-center">
        <p className="text-carbon-300">Este módulo estará disponible próximamente.</p>
      </div>
    </div>
  );
}

const TITULOS_MODULO = {
  jornada: "Jornada",
  pedidos: "Pedidos",
  gastos: "Gastos y Reembolsos",
  caja: "Control de Caja y Reportes",
  pagos: "Pagos",
};

function PanelDashboard() {
  const [moduloActivo, setModuloActivo] = useState("jornada");

  return (
    <DashboardLayout moduloActivo={moduloActivo} onCambiarModulo={setModuloActivo}>
      {moduloActivo === "jornada" && <JornadaView />}
      {moduloActivo === "pagos" && <GestionPagos />}
      {moduloActivo === "pedidos" && <GestionPedidos />}
      {moduloActivo === "gastos" && <GestionGastos />}
      {moduloActivo === "caja" && <GestionCaja />}
      {/*modulos restantes que aún no se implementan*/}
      {moduloActivo !== "jornada" && moduloActivo !== "pagos" && moduloActivo !== "pedidos" && moduloActivo !== "gastos" && moduloActivo !== "caja" && (
        <ModuloProximamente nombre={TITULOS_MODULO[moduloActivo] || moduloActivo} />
      )}
    </DashboardLayout>
  );
}
export default function AppRoutes() {
  const { isAuthenticated, rol } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* pantalla publica de login*/}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={rol === "dueña" ? "/duena" : "/atendedor"} replace />
            ) : (
              <PinLoginView onLoginSuccess={() => {}} />
            )
          }
        />

        {/* panel de la dueña */}
        <Route
          path="/duena"
          element={
            <ProtectedRoute allowedRoles={["dueña"]}>
              <PanelDashboard />
            </ProtectedRoute>
          }
        />

        {/* panel del atendedor */}
        <Route
          path="/atendedor"
          element={
            <ProtectedRoute allowedRoles={["atendedor"]}>
              <PanelDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/autoservicio" element={<AutoservicioView />} />

        {/*redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
