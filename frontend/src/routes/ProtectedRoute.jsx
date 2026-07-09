import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guardián de rutas que protege las vistas según el rol del usuario.
 * @param {React.ReactNode} children - El componente que se quiere renderizar.
 * @param {string[]} allowedRoles - Lista de roles permitidos (ej: ['duena', 'atendedor']).
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, rol, loading } = useAuth();

  // Si está cargando la sesión desde el sessionStorage, mostramos una pantalla de espera
  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
        <p className="text-white animate-pulse">Cargando sistema...</p>
      </div>
    );
  }

  // Si no está autenticado, lo mandamos de patitas a la pantalla del PIN
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado pero su rol no tiene permiso para esta pantalla, lo bloqueamos
  if (allowedRoles && !allowedRoles.includes(rol)) {
    // Si es atendedor y se coló a la vista de dueña, o viceversa, lo mandamos a su panel correspondiente
    return <Navigate to={rol === "dueña" ? "/dueña" : "/atendedor"} replace />;
  }

  // Si todo está en orden, lo dejamos pasar a la vista protegida
  return children;
}